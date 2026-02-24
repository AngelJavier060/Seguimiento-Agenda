package com.agenda.backend.dto;

import com.agenda.backend.entity.TelegramUserConfig;
import com.agenda.backend.entity.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TelegramUserConfigDto {
    private Long id;
    private Long usuarioId;
    private String usuarioUsername;
    private String usuarioNombre;
    private String usuarioApellido;
    private String phoneNumber;
    private String userOrChannel;
    private boolean activo;

    public static TelegramUserConfigDto fromEntity(TelegramUserConfig cfg) {
        Usuario u = cfg.getUsuario();
        return new TelegramUserConfigDto(
                cfg.getId(),
                u != null ? u.getId() : null,
                u != null ? u.getUsername() : null,
                u != null ? u.getNombre() : null,
                u != null ? u.getApellido() : null,
                cfg.getPhoneNumber(),
                cfg.getUserOrChannel(),
                cfg.isActivo()
        );
    }
}
