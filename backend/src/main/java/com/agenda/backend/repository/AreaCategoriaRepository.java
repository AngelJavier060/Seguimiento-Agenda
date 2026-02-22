package com.agenda.backend.repository;

import com.agenda.backend.entity.AreaCategoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AreaCategoriaRepository extends JpaRepository<AreaCategoria, Long> {
    Optional<AreaCategoria> findByNombreIgnoreCase(String nombre);
}
