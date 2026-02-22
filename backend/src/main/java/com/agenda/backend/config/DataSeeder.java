package com.agenda.backend.config;

import com.agenda.backend.entity.Role;
import com.agenda.backend.entity.Usuario;
import com.agenda.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedAdmin() {
        return args -> {
            boolean exists = usuarioRepository.findByUsernameIgnoreCase("Javier")
                    .or(() -> usuarioRepository.findByEmailIgnoreCase("javierangelmsn@outlook.es")).isPresent();
            if (!exists) {
                Usuario admin = Usuario.builder()
                        .username("Javier")
                        .email("javierangelmsn@outlook.es")
                        .password(passwordEncoder.encode("Alexandra1"))
                        .role(Role.ADMIN)
                        .build();
                usuarioRepository.save(admin);
            }
        };
    }
}
