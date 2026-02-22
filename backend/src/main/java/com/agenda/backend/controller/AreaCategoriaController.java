package com.agenda.backend.controller;

import com.agenda.backend.entity.AreaCategoria;
import com.agenda.backend.repository.AreaCategoriaRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.dao.DataIntegrityViolationException;

import java.net.URI;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/areas")
@RequiredArgsConstructor
public class AreaCategoriaController {

    private final AreaCategoriaRepository repo;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public List<AreaCategoria> listar() {
        return repo.findAll(Sort.by(Sort.Direction.ASC, "nombre"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AreaCategoria> crear(@Valid @RequestBody AreaCategoria req) {
        String nombre = req.getNombre() == null ? "" : req.getNombre().trim();
        if (nombre.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre es obligatorio");
        if (repo.findByNombreIgnoreCase(nombre).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El área ya existe");
        }
        try {
            AreaCategoria saved = repo.save(AreaCategoria.builder().nombre(nombre).build());
            return ResponseEntity.created(URI.create("/api/v1/areas/" + saved.getId())).body(saved);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El área ya existe");
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AreaCategoria actualizar(@PathVariable Long id, @Valid @RequestBody AreaCategoria req) {
        AreaCategoria a = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Área no encontrada"));
        String nombre = req.getNombre() == null ? "" : req.getNombre().trim();
        if (nombre.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre es obligatorio");
        repo.findByNombreIgnoreCase(nombre).ifPresent(existing -> {
            if (!existing.getId().equals(id)) throw new ResponseStatusException(HttpStatus.CONFLICT, "El área ya existe");
        });
        a.setNombre(nombre);
        return repo.save(a);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        AreaCategoria a = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Área no encontrada"));
        repo.delete(a);
        return ResponseEntity.noContent().build();
    }
}
