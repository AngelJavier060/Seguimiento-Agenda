package com.agenda.backend.dto;

import com.agenda.backend.entity.Role;
import com.agenda.backend.entity.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDto {
    private Long id;
    private String nombre;
    private String apellido;
    private String username;
    private String email;
    private String telefono;
    private Role role;
    private String passwordMasked;

    public static UsuarioDto fromEntity(Usuario u) {
        return new UsuarioDto(
                u.getId(),
                u.getNombre(),
                u.getApellido(),
                u.getUsername(),
                u.getEmail(),
                u.getTelefono(),
                u.getRole(),
                "********"
        );
    }
}
