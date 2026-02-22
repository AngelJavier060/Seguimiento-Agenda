package com.agenda.backend.controller;

import com.agenda.backend.dto.UsuarioDto;
import com.agenda.backend.dto.UsuarioRequest;
import com.agenda.backend.entity.Role;
import com.agenda.backend.entity.Usuario;
import com.agenda.backend.repository.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.dao.DataIntegrityViolationException;
import java.net.URI;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    private final UsuarioRepository repo;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public List<UsuarioDto> listar() {
        return repo.findAll().stream().map(UsuarioDto::fromEntity).toList();
    }

    @PostMapping
    public ResponseEntity<UsuarioDto> crear(@Valid @RequestBody UsuarioRequest req) {
        if (repo.findByUsernameIgnoreCase(req.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de usuario ya existe");
        }
        if (repo.findByEmailIgnoreCase(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El correo electrónico ya está registrado");
        }
        Usuario u = Usuario.builder()
                .nombre(req.getNombre())
                .apellido(req.getApellido())
                .username(req.getUsername())
                .email(req.getEmail())
                .telefono(req.getTelefono())
                .password(passwordEncoder.encode(req.getPassword() == null ? "" : req.getPassword()))
                .role(req.getRole() == null ? Role.USER : req.getRole())
                .build();
        u = repo.save(u);
        return ResponseEntity.created(URI.create("/api/v1/usuarios/" + u.getId())).body(UsuarioDto.fromEntity(u));
    }

    @PutMapping("/{id}")
    public UsuarioDto actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioRequest req) {
        Usuario u = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));
        // Verificar unicidad de username
        repo.findByUsernameIgnoreCase(req.getUsername())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de usuario ya existe");
                });
        // Verificar unicidad de email
        repo.findByEmailIgnoreCase(req.getEmail())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El correo electrónico ya está registrado");
                });
        Role anterior = u.getRole();
        Role nuevoRol = req.getRole() != null ? req.getRole() : u.getRole();
        if (anterior == Role.ADMIN && nuevoRol != Role.ADMIN) {
            long admins = repo.countByRole(Role.ADMIN);
            if (admins <= 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede cambiar el rol del último administrador");
            }
        }
        u.setNombre(req.getNombre());
        u.setApellido(req.getApellido());
        u.setUsername(req.getUsername());
        u.setEmail(req.getEmail());
        u.setTelefono(req.getTelefono());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        if (req.getRole() != null) {
            u.setRole(req.getRole());
        }
        return UsuarioDto.fromEntity(repo.save(u));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Usuario u = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));
        if (u.getRole() == Role.ADMIN) {
            long admins = repo.countByRole(Role.ADMIN);
            if (admins <= 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede eliminar el último administrador");
            }
        }
        repo.delete(u);
        return ResponseEntity.noContent().build();
    }
}
