package com.agenda.backend.controller;

import com.agenda.backend.dto.AdminKpis;
import com.agenda.backend.entity.Actividad;
import com.agenda.backend.entity.Role;
import com.agenda.backend.repository.ActividadRepository;
import com.agenda.backend.repository.AlertaConfigRepository;
import com.agenda.backend.repository.TelegramConfigRepository;
import com.agenda.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final ActividadRepository actividadRepository;
    private final AlertaConfigRepository alertaConfigRepository;
    private final TelegramConfigRepository telegramConfigRepository;

    @GetMapping("/kpis")
    public AdminKpis kpis() {
        long totalUsuarios = usuarioRepository.count();
        long admins = usuarioRepository.countByRole(Role.ADMIN);
        long usuarios = usuarioRepository.countByRole(Role.USER);

        long actividadesTotal = actividadRepository.count();
        long actividadesPendientes = actividadRepository.countByEstado(Actividad.EstadoActividad.pending);
        long actividadesCompletadas = actividadRepository.countByEstado(Actividad.EstadoActividad.done);
        long actividadesVencidas = actividadRepository.countByEstado(Actividad.EstadoActividad.overdue);

        long alertasTotal = alertaConfigRepository.count();
        long alertasHabilitadas = alertaConfigRepository.countByHabilitada(true);

        boolean telegramActivo = telegramConfigRepository.findById(1L).map(t -> t.isActivo()).orElse(false);

        return new AdminKpis(
                totalUsuarios,
                admins,
                usuarios,
                actividadesTotal,
                actividadesPendientes,
                actividadesCompletadas,
                actividadesVencidas,
                alertasTotal,
                alertasHabilitadas,
                telegramActivo
        );
    }
}
