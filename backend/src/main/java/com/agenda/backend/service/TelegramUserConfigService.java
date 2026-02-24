package com.agenda.backend.service;

import com.agenda.backend.dto.TelegramUserConfigDto;
import com.agenda.backend.dto.TelegramUserConfigRequest;
import com.agenda.backend.entity.TelegramUserConfig;
import com.agenda.backend.entity.Usuario;
import com.agenda.backend.repository.TelegramUserConfigRepository;
import com.agenda.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TelegramUserConfigService {

    private final TelegramUserConfigRepository repo;
    private final UsuarioRepository usuarioRepo;

    public List<TelegramUserConfigDto> listar() {
        return repo.findAll().stream().map(TelegramUserConfigDto::fromEntity).toList();
    }

    public TelegramUserConfigDto guardar(TelegramUserConfigRequest req) {
        Usuario u = usuarioRepo.findById(req.getUsuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        TelegramUserConfig cfg = repo.findByUsuarioId(u.getId()).orElseGet(() -> {
            TelegramUserConfig c = new TelegramUserConfig();
            c.setUsuario(u);
            c.setActivo(true);
            return c;
        });

        cfg.setPhoneNumber(req.getPhoneNumber());
        cfg.setUserOrChannel(req.getUserOrChannel());
        if (req.getActivo() != null) {
            cfg.setActivo(req.getActivo());
        }

        return TelegramUserConfigDto.fromEntity(repo.save(cfg));
    }

    public void eliminar(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Configuración de Telegram no encontrada");
        }
        repo.deleteById(id);
    }

    public TelegramUserConfigDto actualizarActivo(Long id, boolean activo) {
        TelegramUserConfig cfg = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Configuración de Telegram no encontrada"));
        cfg.setActivo(activo);
        return TelegramUserConfigDto.fromEntity(repo.save(cfg));
    }
}
