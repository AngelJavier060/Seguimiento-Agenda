package com.agenda.backend.controller;

import com.agenda.backend.dto.AuthResponse;
import com.agenda.backend.dto.LoginRequest;
import com.agenda.backend.entity.Usuario;
import com.agenda.backend.repository.UsuarioRepository;
import com.agenda.backend.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsernameOrEmail(), req.getPassword())
            );
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body(Map.of("message", "Credenciales inválidas"));
        }

        Usuario u = usuarioRepository.findByUsernameIgnoreCase(req.getUsernameOrEmail())
                .or(() -> usuarioRepository.findByEmailIgnoreCase(req.getUsernameOrEmail()))
                .orElseThrow();

        String token = jwtService.generateToken(
                org.springframework.security.core.userdetails.User
                        .withUsername(u.getUsername())
                        .password(u.getPassword())
                        .authorities("ROLE_" + u.getRole().name())
                        .build(),
                u.getRole()
        );

        return ResponseEntity.ok(new AuthResponse(token, u.getUsername(), u.getEmail(), u.getRole(), u.getNombre(), u.getApellido()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        Usuario u = usuarioRepository.findByUsernameIgnoreCase(username).orElseThrow();
        return ResponseEntity.ok(new AuthResponse(null, u.getUsername(), u.getEmail(), u.getRole(), u.getNombre(), u.getApellido()));
    }
}
