package com.agenda.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "alerta_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertaConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private TipoAlerta tipo;

    @Column(nullable = false)
    private boolean habilitada;

    public enum TipoAlerta {
        ALERTA_PROXIMA,
        ALERTA_VENCIDA,
        REPORTE_DIARIO,
        REPORTE_SEMANAL,
        REPORTE_MENSUAL,
        RECORDATORIO_VENCIDAS
    }
}
