package com.agenda.backend.controller;

import com.agenda.backend.repository.ActividadRepository;
import com.agenda.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/debug")
@RequiredArgsConstructor
public class DiagnosticoController {

    private final UsuarioRepository usuarioRepo;
    private final ActividadRepository actividadRepo;

    @GetMapping("/whoami")
    public Map<String, Object> whoami() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String principalName = auth != null ? auth.getName() : null;

        Long resolvedId = null;
        if (auth != null && auth.getPrincipal() instanceof com.agenda.backend.security.CustomUserDetails) {
            resolvedId = ((com.agenda.backend.security.CustomUserDetails) auth.getPrincipal()).getId();
        }

        var usuario = resolvedId != null
                ? usuarioRepo.findById(resolvedId).orElse(null)
                : (principalName != null ? usuarioRepo.findByUsernameIgnoreCase(principalName).orElse(null) : null);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("principal_en_token", principalName);
        result.put("principal_id", resolvedId);
        if (usuario != null) {
            result.put("usuario_id", usuario.getId());
            result.put("username", usuario.getUsername());
            result.put("email", usuario.getEmail());
            result.put("role", usuario.getRole());
            long count = actividadRepo.countByUsuarioId(usuario.getId());
            result.put("actividades_en_bd", count);
            var actividades = actividadRepo.findByUsuarioId(usuario.getId()).stream()
                .map(a -> Map.of("id", a.getId(), "nombre", a.getNombre()))
                .collect(Collectors.toList());
            result.put("lista_actividades", actividades);
        } else {
            result.put("error", "Usuario no encontrado en BD con username: " + principalName);
        }

        result.put("todos_usuarios", usuarioRepo.findAll().stream()
            .map(u -> Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "email", u.getEmail(),
                "role", u.getRole().name(),
                "actividades", actividadRepo.countByUsuarioId(u.getId())
            ))
            .collect(Collectors.toList()));

        return result;
    }
}
