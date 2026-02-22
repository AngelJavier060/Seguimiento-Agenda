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

    @Query("SELECT a FROM Actividad a WHERE a.estado NOT IN ('done','cancelled') AND a.fechaLimite < :now")
    List<Actividad> findOverdue(LocalDateTime now);

    @Query("SELECT a FROM Actividad a WHERE a.estado NOT IN ('done','cancelled') AND a.fechaLimite BETWEEN :start AND :end")
    List<Actividad> findDueBetween(LocalDateTime start, LocalDateTime end);

    // Actividades activas (pendientes/en proceso) con fecha límite futura — para alertas graduadas
    @Query("SELECT a FROM Actividad a WHERE a.estado NOT IN ('done','cancelled','overdue') AND a.fechaLimite > :now ORDER BY a.fechaLimite ASC")
    List<Actividad> findActivasPendientes(LocalDateTime now);

    // Actividades vencidas que no están completadas ni canceladas — para recordatorio de vencidas
    @Query("SELECT a FROM Actividad a WHERE a.estado = 'overdue' ORDER BY a.fechaLimite ASC")
    List<Actividad> findVencidas();

    long countByEstado(Actividad.EstadoActividad estado);

    long countByPrioridad(Actividad.Prioridad prioridad);

    // ── Queries filtradas por usuario ──

    List<Actividad> findByUsuarioId(Long usuarioId);

    @Query("SELECT a FROM Actividad a WHERE a.usuario.id = :uid AND a.estado NOT IN ('done','cancelled') AND a.fechaLimite < :now")
    List<Actividad> findOverdueByUsuario(Long uid, LocalDateTime now);

    @Query("SELECT a FROM Actividad a WHERE a.usuario.id = :uid AND a.estado NOT IN ('done','cancelled') AND a.fechaLimite BETWEEN :start AND :end")
    List<Actividad> findDueBetweenByUsuario(Long uid, LocalDateTime start, LocalDateTime end);

    long countByUsuarioIdAndEstado(Long usuarioId, Actividad.EstadoActividad estado);

    @Query("SELECT a FROM Actividad a WHERE a.usuario.id = :uid AND a.prioridad = :prioridad")
    List<Actividad> findByUsuarioIdAndPrioridad(Long uid, Actividad.Prioridad prioridad);

    @Query("SELECT a FROM Actividad a WHERE a.usuario.id = :uid AND a.estado NOT IN ('done','cancelled','overdue') AND a.fechaLimite > :now ORDER BY a.fechaLimite ASC")
    List<Actividad> findActivasPendientesByUsuario(Long uid, LocalDateTime now);

    @Query("SELECT a FROM Actividad a WHERE a.usuario.id = :uid AND a.estado = 'overdue' ORDER BY a.fechaLimite ASC")
    List<Actividad> findVencidasByUsuario(Long uid);

    long countByUsuarioId(Long usuarioId);
}
