package com.agenda.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "area_categoria", uniqueConstraints = {@UniqueConstraint(columnNames = {"nombre"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AreaCategoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 2, max = 60)
    @Column(nullable = false, length = 60)
    private String nombre;
}
