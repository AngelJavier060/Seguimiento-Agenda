package com.agenda.backend.repository;

import com.agenda.backend.entity.Actividad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActividadRepository extends JpaRepository<Actividad, Long> {

    List<Actividad> findByEstadoOrderByFechaLimiteAsc(Actividad.EstadoActividad estado);

    List<Actividad> findByPrioridad(Actividad.Prioridad prioridad);

    @Query("SELECT a FROM Actividad a WHERE a.estado <> 'done' AND a.fechaLimite < :now")
    List<Actividad> findOverdue(LocalDateTime now);

    @Query("SELECT a FROM Actividad a WHERE a.estado <> 'done' AND a.fechaLimite BETWEEN :start AND :end")
    List<Actividad> findDueBetween(LocalDateTime start, LocalDateTime end);

    long countByEstado(Actividad.EstadoActividad estado);

    long countByPrioridad(Actividad.Prioridad prioridad);
}
