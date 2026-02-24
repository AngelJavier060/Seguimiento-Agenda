package com.agenda.backend.security;

import com.agenda.backend.entity.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

/**
 * UserDetails personalizado que incluye el ID del usuario.
 * Esto permite que los servicios trabajen de forma segura con el userId
 * y no solo con el username, evitando cualquier posible ambigüedad.
 */
public class CustomUserDetails extends User {

    private final Long id;

    public CustomUserDetails(Usuario usuario, Collection<? extends GrantedAuthority> authorities) {
        super(usuario.getUsername(), usuario.getPassword(), authorities);
        this.id = usuario.getId();
    }

    public Long getId() {
        return id;
    }
}
