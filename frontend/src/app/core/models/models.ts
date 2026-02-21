export type Prioridad = 'alta' | 'media' | 'baja';
export type EstadoActividad = 'pending' | 'done' | 'overdue';

export interface Actividad {
    id: number;
    nombre: string;
    descripcion?: string;
    fechaLimite: string;
    prioridad: Prioridad;
    area: string;
    estado: EstadoActividad;
    fechaCreacion?: string;
}

export interface ActividadRequest {
    nombre: string;
    descripcion?: string;
    fechaLimite: string;
    prioridad: Prioridad;
    area: string;
}

export interface Estadisticas {
    total: number;
    completadas: number;
    pendientes: number;
    vencidas: number;
    cumplimientoPct: number;
    altaPrioridad: number;
    vencenEstaSemana: number;
    tasaVencidas: number;
}

export interface AlertaConfig {
    id: number;
    tipo: string;
    habilitada: boolean;
}

export interface Notificacion {
    id: number;
    tipo: string;
    mensaje: string;
    destinatario: string;
    fechaEnvio: string;
    estadoEnvio: string;
}

export interface TelegramConfig {
    id: number;
    chatId: string;
    botToken: string;
    activo: boolean;
}
