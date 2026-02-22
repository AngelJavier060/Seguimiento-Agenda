package com.agenda.backend.dto;

import com.agenda.backend.entity.Actividad;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class ActividadRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String descripcion;

    @NotNull(message = "La fecha límite es obligatoria")
    private LocalDateTime fechaLimite;

    private Actividad.Prioridad prioridad = Actividad.Prioridad.media;

    @NotBlank(message = "El área es obligatoria")
    private String area;

    // Recurrencia mensual (opcional)
    private Boolean recurrente = false;
    private Integer recDiaMes; // 1-28 si aplica
    private Boolean recUltimoDia; // true si es el último día del mes
    private LocalTime recHora; // Hora HH:mm[:ss]
    private Integer recMeses; // 0 = sin límite
}
