package com.agenda.backend.controller;

import com.agenda.backend.dto.ActividadRequest;
import com.agenda.backend.dto.EstadisticasResponse;
import com.agenda.backend.entity.Actividad;
import com.agenda.backend.service.ActividadService;
import com.agenda.backend.service.ExportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/actividades")
@CrossOrigin("*")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER','ADMIN')")
public class ActividadController {

    private final ActividadService service;
    private final ExportService exportService;

    /** Listar actividades del usuario autenticado */
    @GetMapping
    public List<Actividad> listarMias() {
        return service.listarPorUsuario();
    }

    /** Admin: listar TODAS las actividades de todos los usuarios */
    @GetMapping("/todas")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Actividad> listarTodas() {
        return service.listarTodas();
    }

    @GetMapping("/{id}")
    public Actividad obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    /** Stats del usuario autenticado */
    @GetMapping("/stats")
    public EstadisticasResponse estadisticas() {
        return service.estadisticasPorUsuario();
    }

    /** Admin: stats globales */
    @GetMapping("/stats/todas")
    @PreAuthorize("hasRole('ADMIN')")
    public EstadisticasResponse estadisticasGlobales() {
        return service.estadisticas();
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportarExcel(@RequestParam(name = "estado", required = false, defaultValue = "all") String estado) {
        byte[] data = exportService.exportarExcel(estado);

        String sufijo;
        String normalized = estado == null ? "all" : estado.toLowerCase();
        switch (normalized) {
            case "done", "completadas" -> sufijo = "completadas";
            case "pending", "pendientes" -> sufijo = "pendientes";
            default -> sufijo = "todas";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=actividades-" + sufijo + ".xlsx");
        headers.setContentLength(data.length);
        return ResponseEntity.ok().headers(headers).body(data);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportarPdf(@RequestParam(name = "estado", required = false, defaultValue = "all") String estado) {
        byte[] data = exportService.exportarPdf(estado);

        String sufijo;
        String normalized = estado == null ? "all" : estado.toLowerCase();
        switch (normalized) {
            case "done", "completadas" -> sufijo = "completadas";
            case "pending", "pendientes" -> sufijo = "pendientes";
            default -> sufijo = "todas";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=actividades-" + sufijo + ".pdf");
        headers.setContentLength(data.length);
        return ResponseEntity.ok().headers(headers).body(data);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Actividad crear(@Valid @RequestBody ActividadRequest req) {
        return service.crear(req);
    }

    @PutMapping("/{id}")
    public Actividad actualizar(@PathVariable Long id, @Valid @RequestBody ActividadRequest req) {
        return service.actualizar(id, req);
    }

    @PutMapping("/{id}/completar")
    public Actividad completar(@PathVariable Long id) {
        return service.completar(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
