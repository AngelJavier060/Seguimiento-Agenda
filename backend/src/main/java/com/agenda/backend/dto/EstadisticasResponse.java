package com.agenda.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EstadisticasResponse {
    private long total;
    private long completadas;
    private long pendientes;
    private long vencidas;
    private int cumplimientoPct;

    private long altaPrioridad;
    private long vencenEstaSemana;
    private int tasaVencidas;
}
