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
        String userOrEmail = req.getUsernameOrEmail() != null ? req.getUsernameOrEmail().trim() : "";
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userOrEmail, req.getPassword())
            );
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body(Map.of("message", "Credenciales inválidas"));
        }

        Usuario u = usuarioRepository.findByUsernameIgnoreCase(userOrEmail)
                .or(() -> usuarioRepository.findByEmailIgnoreCase(userOrEmail))
                .orElseThrow();

        String token = jwtService.generateToken(u);

        return ResponseEntity.ok(new AuthResponse(token, u.getUsername(), u.getEmail(), u.getRole(), u.getNombre(), u.getApellido()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Object principal = authentication.getPrincipal();
        Usuario u;
        if (principal instanceof com.agenda.backend.security.CustomUserDetails) {
            Long id = ((com.agenda.backend.security.CustomUserDetails) principal).getId();
            u = usuarioRepository.findById(id).orElseThrow();
        } else {
            String username = authentication.getName();
            u = usuarioRepository.findByUsernameIgnoreCase(username).orElseThrow();
        }

        return ResponseEntity.ok(new AuthResponse(null, u.getUsername(), u.getEmail(), u.getRole(), u.getNombre(), u.getApellido()));
    }
}
