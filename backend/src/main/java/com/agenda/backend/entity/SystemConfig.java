package com.agenda.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfig {

    @Id
    @Builder.Default
    private Long id = 1L; // singleton row

    @Column(name = "system_name", nullable = false)
    private String systemName;

    @Column(name = "description", length = 1000)
    private String description;
}
