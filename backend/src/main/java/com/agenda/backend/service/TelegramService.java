package com.agenda.backend.service;

import com.agenda.backend.entity.Notificacion;
import com.agenda.backend.entity.TelegramConfig;
import com.agenda.backend.entity.TelegramUserConfig;
import com.agenda.backend.repository.NotificacionRepository;
import com.agenda.backend.repository.TelegramConfigRepository;
import com.agenda.backend.repository.TelegramUserConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramService {

    private final TelegramConfigRepository configRepo;
    private final NotificacionRepository notifRepo;
    private final TelegramUserConfigRepository userConfigRepo;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public TelegramConfig getConfig() {
        return configRepo.findById(1L)
                .orElseGet(() -> TelegramConfig.builder().id(1L).chatId("").botToken("").activo(false).build());
    }

    public TelegramConfig saveConfig(TelegramConfig cfg) {
        cfg.setId(1L);
        return configRepo.save(cfg);
    }

    /**
     * Envío global usando la configuración por defecto (canal general).
     */
    public boolean enviarMensaje(String mensaje, String tipo) {
        TelegramConfig cfg = getConfig();
        if (!cfg.isActivo() || cfg.getBotToken() == null || cfg.getBotToken().isBlank()) {
            log.warn("Telegram no configurado o inactivo. Mensaje no enviado: {}", tipo);
            guardarNotificacion(tipo, mensaje, resolveDestinatario(cfg), "❌ No enviado");
            return false;
        }
        String chat = resolveChatId(cfg);
        if (chat == null || chat.isBlank()) {
            log.warn("Telegram sin destino (user/channel o chatId vacío). No se envía: {}", tipo);
            guardarNotificacion(tipo, mensaje, resolveDestinatario(cfg), "❌ No enviado (sin destino)");
            return false;
        }
        return enviarMensajeConDestino(cfg, chat, resolveDestinatario(cfg), mensaje, tipo);
    }

    /**
     * Enviar mensaje teniendo en cuenta la configuración por usuario si existe y está activa.
     * Si no hay configuración válida para el usuario, se usa el destino global.
     */
    public boolean enviarMensajeAUsuario(Long usuarioId, String mensaje, String tipo) {
        TelegramConfig cfg = getConfig();
        if (!cfg.isActivo() || cfg.getBotToken() == null || cfg.getBotToken().isBlank()) {
            log.warn("Telegram no configurado o inactivo. Mensaje no enviado (usuario {}): {}", usuarioId, tipo);
            guardarNotificacion(tipo, mensaje, "N/A", "❌ No enviado");
            return false;
        }

        String chat = null;
        String destinatario = null;

        if (usuarioId != null) {
            TelegramUserConfig userCfg = userConfigRepo.findByUsuarioId(usuarioId).orElse(null);
            if (userCfg != null && userCfg.isActivo()
                    && userCfg.getUserOrChannel() != null && !userCfg.getUserOrChannel().isBlank()) {
                chat = userCfg.getUserOrChannel();
                destinatario = chat;
            }
        }

        if (chat == null || chat.isBlank()) {
            chat = resolveChatId(cfg);
            destinatario = resolveDestinatario(cfg);
        }

        if (chat == null || chat.isBlank()) {
            log.warn("Telegram sin destino para usuario {}. No se envía: {}", usuarioId, tipo);
            guardarNotificacion(tipo, mensaje, destinatario != null ? destinatario : "N/A", "❌ No enviado (sin destino)");
            return false;
        }

        return enviarMensajeConDestino(cfg, chat, destinatario, mensaje, tipo);
    }

    /**
     * Envía un mensaje a todos los usuarios que tengan configuración de Telegram activa.
     * Si no hay configuraciones activas, hace fallback al destino global.
     */
    public boolean enviarMensajeATodosUsuarios(String mensaje, String tipo) {
        TelegramConfig cfg = getConfig();
        if (!cfg.isActivo() || cfg.getBotToken() == null || cfg.getBotToken().isBlank()) {
            log.warn("Telegram no configurado o inactivo. Mensaje masivo no enviado: {}", tipo);
            guardarNotificacion(tipo, mensaje, "N/A", "❌ No enviado");
            return false;
        }

        List<TelegramUserConfig> configs = userConfigRepo.findAll();
        boolean algunoEnviado = false;
        for (TelegramUserConfig userCfg : configs) {
            if (!userCfg.isActivo()) continue;
            String chat = userCfg.getUserOrChannel();
            if (chat == null || chat.isBlank()) continue;
            boolean ok = enviarMensajeConDestino(cfg, chat, chat, mensaje, tipo);
            algunoEnviado = algunoEnviado || ok;
        }

        if (!algunoEnviado) {
            // Fallback al destino global configurado
            return enviarMensaje(mensaje, tipo);
        }
        return true;
    }

    public boolean testConexion() {
        TelegramConfig cfg = getConfig();
        if (cfg.getBotToken() == null || cfg.getBotToken().isBlank())
            return false;
        try {
            String url = "https://api.telegram.org/bot" + cfg.getBotToken() + "/getMe";
            HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 200;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean enviarMensajeConDestino(TelegramConfig cfg, String chat, String destinatario, String mensaje, String tipo) {
        try {
            String encodedMsg = URLEncoder.encode(mensaje, StandardCharsets.UTF_8);
            String encodedChat = URLEncoder.encode(chat, StandardCharsets.UTF_8);
            String url = "https://api.telegram.org/bot" + cfg.getBotToken()
                    + "/sendMessage?chat_id=" + encodedChat
                    + "&text=" + encodedMsg + "&parse_mode=HTML";
            HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            boolean ok = response.statusCode() == 200;
            guardarNotificacion(tipo, mensaje, destinatario != null ? destinatario : "N/A",
                    ok ? "✅ Enviado" : "❌ Error " + response.statusCode());
            return ok;
        } catch (Exception e) {
            log.error("Error enviando mensaje Telegram: {}", e.getMessage());
            guardarNotificacion(tipo, mensaje, destinatario != null ? destinatario : "N/A", "❌ Error: " + e.getMessage());
            return false;
        }
    }

    private void guardarNotificacion(String tipo, String mensaje, String destinatario, String estado) {
        notifRepo.save(Notificacion.builder()
                .tipo(tipo).mensaje(mensaje)
                .destinatario(destinatario != null ? destinatario : "N/A")
                .estadoEnvio(estado).build());
    }

    private String resolveChatId(TelegramConfig cfg) {
        // Prefer user/channel if provided, else chatId
        if (cfg.getUserOrChannel() != null && !cfg.getUserOrChannel().isBlank()) return cfg.getUserOrChannel();
        if (cfg.getChatId() != null && !cfg.getChatId().isBlank()) return cfg.getChatId();
        return ""; // No enviar por número telefónico: Bot API no soporta phone como chat_id
    }

    private String resolveDestinatario(TelegramConfig cfg) {
        if (cfg.getUserOrChannel() != null && !cfg.getUserOrChannel().isBlank()) return cfg.getUserOrChannel();
        if (cfg.getChatId() != null && !cfg.getChatId().isBlank()) return cfg.getChatId();
        return cfg.getPhoneNumber() != null && !cfg.getPhoneNumber().isBlank() ? cfg.getPhoneNumber() : "N/A";
    }
}
