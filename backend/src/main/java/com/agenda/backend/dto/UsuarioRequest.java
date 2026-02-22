package com.agenda.backend.dto;

import com.agenda.backend.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioRequest {
    private String nombre;
    private String apellido;

    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    @Email
    private String email;

    @Size(max = 24)
    private String telefono;

    private Role role;

    private String password; // optional on update
}
