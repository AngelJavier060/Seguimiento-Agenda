package com.agenda.backend.service;

import com.agenda.backend.entity.Actividad;
import com.agenda.backend.entity.Usuario;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class N8nWebhookService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${n8n.webhook.url:}")
    private String webhookUrl;

    @Value("${app.public.url:}")
    private String appPublicUrl;

    public void actividadCreada(Actividad a) {
        postActividadEvent("ACTIVIDAD_CREADA", a);
    }

    public void actividadActualizada(Actividad a) {
        postActividadEvent("ACTIVIDAD_ACTUALIZADA", a);
    }

    public void actividadCompletada(Actividad a) {
        postActividadEvent("ACTIVIDAD_COMPLETADA", a);
    }

    public void actividadVencidaAuto(Actividad a) {
        postActividadEvent("ACTIVIDAD_VENCIDA_AUTO", a);
    }

    private void postActividadEvent(String event, Actividad a) {
        if (webhookUrl == null || webhookUrl.isBlank()) return;

        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("event", event);
            payload.put("id", a.getId());
            payload.put("nombre", a.getNombre());
            payload.put("descripcion", a.getDescripcion());
            payload.put("estado", a.getEstado() != null ? a.getEstado().name() : null);
            payload.put("fechaLimite", a.getFechaLimite());
            payload.put("fechaFinalizacion", a.getFechaFinalizacion());
            payload.put("prioridad", a.getPrioridad() != null ? a.getPrioridad().name() : null);
            payload.put("area", a.getArea());

            Usuario u = a.getUsuario();
            if (u != null) {
                payload.put("usuarioId", u.getId());
                payload.put("username", u.getUsername());
                payload.put("nombreUsuario", u.getNombre());
                payload.put("apellidoUsuario", u.getApellido());
                payload.put("email", u.getEmail());
            }

            if (appPublicUrl != null && !appPublicUrl.isBlank()) {
                String base = appPublicUrl.endsWith("/") ? appPublicUrl.substring(0, appPublicUrl.length() - 1) : appPublicUrl;
                payload.put("appUrl", base);
                payload.put("agendaUrl", base + "/agenda");
            }

            String json = objectMapper.writeValueAsString(payload);
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(webhookUrl))
                    .timeout(Duration.ofSeconds(6))
                    .header("Content-Type", "application/json; charset=utf-8")
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() < 200 || resp.statusCode() >= 300) {
                log.warn("n8n webhook respondió {}: {}", resp.statusCode(), resp.body());
            }
        } catch (Exception e) {
            log.warn("No se pudo enviar evento a n8n: {}", e.getMessage());
        }
    }
}
