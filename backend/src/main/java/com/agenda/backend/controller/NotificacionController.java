package com.agenda.backend.controller;

import com.agenda.backend.entity.Notificacion;
import com.agenda.backend.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionRepository repo;

    @GetMapping
    public List<Notificacion> listar() {
        return repo.findAllByOrderByFechaEnvioDesc();
    }
}
