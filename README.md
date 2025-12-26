# PixelForge - Sistema Distribuido de Procesamiento de Imágenes

![Status](https://img.shields.io/badge/status-active-success.svg)
![Node](https://img.shields.io/badge/node-v20+-green.svg)
![Docker](https://img.shields.io/badge/docker-compose-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**PixelForge** es una arquitectura de microservicios diseñada para el procesamiento asíncrono de imágenes de alto rendimiento. Desacopla la recepción de archivos de su procesamiento utilizando colas de mensajes, garantizando que la API permanezca receptiva bajo alta carga.

El sistema permite subir imágenes, redimensionarlas y cambiar su formato basándose en una lista estricta de configuraciones permitidas, almacenando los resultados en un sistema compatible con S3 (MinIO).

## 📋 Tabla de Contenidos
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Stack Tecnológico](#-stack-tecnológico)
- [Características Principales](#-características-principales)
- [Instalación y Uso](#-instalación-y-uso)
- [Documentación de la API](#-documentación-de-la-api)
- [Variables de Entorno](#-variables-de-entorno)
- [Estructura del Proyecto](#-estructura-del-proyecto)

## 🏗 Arquitectura del Sistema

El sistema utiliza un patrón **Producer-Consumer** con almacenamiento temporal y persistente.

```mermaid
graph LR
    A[Cliente] -- POST /upload --> B(API Gateway)
    B -- Valida y Sube Raw --> C[(MinIO Storage)]
    B -- Crea Job --> D[Redis / BullMQ]
    D -- Consume Job --> E[Worker Service]
    E -- Descarga Raw --> C
    E -- Procesa Imagen --> E
    E -- Sube Processed --> C
    E -- Actualiza Estado --> F[(PostgreSQL)]
    A -- GET /status/:id --> B
    B -- Lee Estado --> F
```
1. **API Service (Producer)**: Recibe la imagen, valida metadatos con Zod, sube el archivo crudo a MinIO y encola un trabajo en BullMQ.
2. **Message Broker**: Redis gestiona la cola de trabajos, asegurando persistencia y reintentos.
3. **Worker Service (Consumer)**: Proceso aislado que toma trabajos, realiza el procesamiento intensivo de CPU (Sharp) y actualiza el estado.
4. **Storage**: MinIO actúa como un Object Storage compatible con S3 para guardar tanto las imágenes originales como las procesadas

---

## 🚀 Stack Tecnológico

- **Core:** Node.js, TypeScript  
- **API Framework:** Express.js  
- **Procesamiento:** Sharp (High performance image processing)  
- **Colas & Mensajería:** BullMQ, Redis  
- **Base de Datos:** PostgreSQL (Metadatos y estado de jobs)  
- **Validación:** Zod (Schema validation)  
- **Storage:** MinIO (S3 Compatible)  
-- **Infraestructura:** Docker, Docker Compose  

---

## ✨ Características Principales

- **Procesamiento Asíncrono:**  
  La API responde en milisegundos devolviendo un `Job ID`, mientras el procesamiento pesado ocurre en segundo plano.

- **Validación Estricta (Allowlist):**  
  Solo se procesan dimensiones y formatos pre-aprobados para evitar abuso de recursos.

  **Dimensiones permitidas:**
  - `800x600`
  - `1280x720`
  - `1920x1080`

  **Formatos permitidos:**
  - `JPEG`
  - `PNG`
  - `WEBP`

- **Escalabilidad Horizontal:**  
  Los Workers pueden escalarse independientemente de la API.

- **Resiliencia:**  
  Manejo automático de reintentos en caso de fallos en el procesamiento.

- **Entorno Dockerizado:**  
  Todo el ecosistema se levanta con un solo comando.

---

## 🛠 Instalación y Uso

### Prerrequisitos

- Docker y Docker Compose instalados.
- Node.js v18+ (solo si se desea ejecutar fuera de Docker).

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/pixelforge.git
cd pixelforge
```

### Paso 2: Configurar Variables de Entorno
Este comando levantará la API, el Worker, Redis, Postgres y MinIO.

```bash
docker-compose up --build -d
```
**El sistema estará disponible en:**

- **API**: http://localhost:3000
- **MinIO Console**: http://localhost:9001 (User/Pass definidos en .env)

---

## 📡 Documentación de la API
### 1. Subir una imagen para procesar
- Endpoint: POST `POST /api/v1/jobs`
- Content-Type: `multipart/form-data`

**Parámetros (Body):**
| Key       | Tipo   | Descripción                          |
| --------- | ------ | ------------------------------------ |
| imageFile | File   | Archivo de imagen (jpg, png).        |
| width     | Int    | Ancho deseado (ej: 1280).            |
| height    | Int    | Alto deseado (ej: 720).              |
| format    | String | Formato de salida (webp, png, jpeg). |

**Respuesta Exitosa (202 Accepted):**
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "queued"
  }
}
```

### 2. Consultar estado del trabajo
- **Endpoint:** `GET /api/v1/jobs/:id`

**Respuesta (Procesado):**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "result": {
    "url": "http://localhost:9000/pixelforge/processed/imagen_1280x720.webp",
    "processedAt": "2023-10-27T10:00:00Z"
  }
}
```

---

## 🔐 Variables de Entorno
```.env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@postgres:5432/pixelforge_db"

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# MinIO (S3 Compatible)
S3_ENDPOINT=minio
S3_PORT=9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=pixelforge-bucket
S3_USE_SSL=false
```

---

## 📂 Estructura del Proyecto
```plaintext
pixelforge/
├── src/
│   ├── api/             # Código del servidor Express (Producer)
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── validators/  # Esquemas Zod
│   ├── worker/          # Código del Worker (Consumer)
│   │   └── processors/  # Lógica de Sharp
│   ├── config/          # Configuración de DB, Redis, S3
│   └── shared/          # Tipos e interfaces compartidas
├── docker-compose.yml
├── Dockerfile.api
├── Dockerfile.worker
└── README.md
```

---

## 🔮 Roadmap y Mejoras Futuras

- [ ] Implementación de Webhooks para notificar al cliente cuando el trabajo termine (evitar polling).
- [ ] Integración con AWS S3 real para entorno de producción.
- [ ] Agregar limpieza automática (TTL) de imágenes originales tras 24hs.
- [ ] Dashboard visual para monitorear la cola de BullMQ (Bull-Board).

---

## 👤 Autor
Desarrollado por Daniel Díaz.
