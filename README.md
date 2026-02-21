# Agenda de Cumplimiento — Full-Stack

Sistema de seguimiento de actividades con backend Spring Boot + PostgreSQL y frontend Angular.

## 🗂️ Estructura del Proyecto

```
Seguimiento-Agenda/
├── backend/          # Spring Boot 3 + PostgreSQL
│   └── src/main/java/com/agenda/backend/
│       ├── entity/       # Actividad, AlertaConfig, Notificacion, TelegramConfig
│       ├── repository/   # JPA Repositories
│       ├── service/      # Lógica de negocio + schedulers Telegram
│       ├── controller/   # REST API /api/v1/...
│       ├── dto/          # Request/Response DTOs
│       └── config/       # CORS, GlobalExceptionHandler
├── frontend/         # Angular 19 (standalone)
│   └── src/app/
│       ├── core/         # Models, Services (Actividad, Alerta, Telegram, Toast)
│       └── features/     # Agenda, Dashboard, Reportes, Alertas
└── docker-compose.yml  # PostgreSQL 15
```

## 🚀 Inicio Rápido

### 1. Levantar la base de datos
```bash
docker-compose up -d
```

### 2. Iniciar el backend
```bash
cd backend
mvn spring-boot:run
```
> API disponible en: http://localhost:8080/api/v1

### 3. Iniciar el frontend
```bash
cd frontend
ng serve
```
> App disponible en: http://localhost:4200

---

## 🔑 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/actividades` | Listar todas las actividades |
| POST | `/api/v1/actividades` | Crear nueva actividad |
| PUT | `/api/v1/actividades/{id}` | Actualizar actividad |
| PUT | `/api/v1/actividades/{id}/completar` | Marcar como completada |
| DELETE | `/api/v1/actividades/{id}` | Eliminar actividad |
| GET | `/api/v1/actividades/stats` | Estadísticas globales |
| GET/PUT | `/api/v1/telegram/config` | Configuración Telegram |
| POST | `/api/v1/telegram/test` | Probar conexión Telegram |
| POST | `/api/v1/reportes/{tipo}` | Enviar reporte (daily/weekly/monthly) |
| GET | `/api/v1/alertas` | Configuración de alertas |
| PUT | `/api/v1/alertas/{id}` | Habilitar/deshabilitar alerta |
| GET | `/api/v1/notificaciones` | Historial de notificaciones |

## ⚙️ Configuración de Telegram

Edita `backend/src/main/resources/application.properties` o configura variables de entorno:
```
TELEGRAM_BOT_TOKEN=tu_token_del_bot
TELEGRAM_CHAT_ID=tu_chat_id
```

O configúralo desde la UI en la pestaña **Reportes** del frontend.

## 🗄️ Base de Datos (PostgreSQL)

| Parámetro | Valor |
|-----------|-------|
| Host | localhost:5432 |
| DB | agenda_db |
| Usuario | agenda_user |
| Contraseña | agenda_pass |
