package com.agenda.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "actividades")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Actividad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el usuario dueño de la actividad
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private Usuario usuario;

    @NotBlank
    @Column(nullable = false)
    private String nombre;

    private String descripcion;

    @NotNull
    @Column(name = "fecha_limite", nullable = false)
    private LocalDateTime fechaLimite;

    @Column(name = "fecha_finalizacion")
    private LocalDateTime fechaFinalizacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Prioridad prioridad;

    @Column(nullable = false)
    private String area;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoActividad estado;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    // Recurrencia mensual (opcional)
    @Column(name = "recurrente")
    private Boolean recurrente = false;

    // Día específico del mes (1-28). Si es null y recUltimoDia=true, se usa último día del mes
    @Column(name = "rec_dia_mes")
    private Integer recDiaMes;

    @Column(name = "rec_ultimo_dia")
    private Boolean recUltimoDia;

    @Column(name = "rec_hora")
    private LocalTime recHora;

    // Número de meses que dura la recurrencia (0 = sin límite)
    @Column(name = "rec_meses")
    private Integer recMeses;

    // Cantidad de ocurrencias generadas
    @Column(name = "rec_generados")
    private Integer recGenerados;

    // Marca para no generar múltiples siguientes ocurrencias desde la misma actividad
    @Column(name = "rec_next_generated")
    private Boolean recNextGenerated;

    // Control de alertas graduadas: cuándo fue la última alerta enviada para esta actividad
    @Column(name = "ultima_alerta_enviada")
    private LocalDateTime ultimaAlertaEnviada;

    // Historial simple de eventos (creación, cambios de estado, recurrencia)
    @ElementCollection
    @CollectionTable(name = "actividad_logs", joinColumns = @JoinColumn(name = "actividad_id"))
    @Column(name = "mensaje", length = 512)
    @Builder.Default
    private List<String> historial = new ArrayList<>();

    public enum Prioridad {
        alta, media, baja
    }

    public enum EstadoActividad {
        pending, inprocess, done, overdue, cancelled
    }
}
