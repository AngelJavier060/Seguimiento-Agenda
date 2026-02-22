# Guía de Despliegue - Backend Seguimiento Agenda

## 🖥️ Desarrollo Local

```bash
# Levantar PostgreSQL y Backend juntos
docker-compose up -d --build

# Backend disponible en: http://localhost:8082
# PostgreSQL disponible en: localhost:5434
```

## 🚀 Producción (PostgreSQL en el Host)

### Paso 1: Configurar PostgreSQL para aceptar conexiones de Docker

```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf

# Cambiar:
listen_addresses = '*'

# Editar pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Agregar al final (permite conexiones desde red Docker):
host    all    all    172.17.0.0/16    md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### Paso 2: Desplegar el Backend

```bash
# En el servidor, ir al directorio del backend
cd /opt/seguimiento-agenda/backend/backend

# Usar docker-compose de producción
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker logs -f seguimiento-agenda-backend
```

### Paso 3: Verificar

```bash
# Probar el backend
curl http://localhost:8081/actuator/health
```

## 📝 Variables de Entorno

| Variable | Descripción | Valor Local | Valor Producción |
|----------|-------------|-------------|------------------|
| DB_URL | URL de PostgreSQL | jdbc:postgresql://localhost:5434/agenda_db | jdbc:postgresql://172.17.0.1:5432/seguimiento_agenda |
| DB_USER | Usuario de BD | agenda_user | seguimiento_user |
| DB_PASS | Contraseña de BD | agenda_pass | Javier_Valle21 |

## 🔧 Comandos Útiles

```bash
# Ver logs del backend
docker logs seguimiento-agenda-backend

# Reiniciar backend
docker-compose -f docker-compose.prod.yml restart

# Detener todo
docker-compose -f docker-compose.prod.yml down

# Reconstruir imagen
docker-compose -f docker-compose.prod.yml up -d --build
```
