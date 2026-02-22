package com.agenda.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminKpis {
    private long totalUsuarios;
    private long admins;
    private long usuarios;

    private long actividadesTotal;
    private long actividadesPendientes;
    private long actividadesCompletadas;
    private long actividadesVencidas;

    private long alertasTotal;
    private long alertasHabilitadas;

    private boolean telegramActivo;
}
