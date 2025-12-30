# PixelForge - Sistema Distribuido de Procesamiento de Imágenes

![Node.js](https://img.shields.io/badge/Node.js-20232A?style=for-the-badge&logo=node.js&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

**PixelForge** es una plataforma de procesamiento de imágenes de alto rendimiento diseñada bajo una arquitectura de microservicios orientada a eventos. Su objetivo principal es desacoplar la ingesta de datos del procesamiento intensivo, garantizando escalabilidad, resiliencia y una experiencia de usuario fluida incluso bajo cargas elevadas.

El sistema implementa un patrón **Producer-Consumer** robusto, utilizando **BullMQ** y **Redis** para la gestión de colas, y **MinIO** como almacenamiento de objetos compatible con S3.

## 📋 Tabla de Contenidos

- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Principios de Diseño](#-principios-de-diseño)
- [Stack Tecnológico](#-stack-tecnológico)
- [Características Principales](#-características-principales)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Uso](#-instalación-y-uso)
- [Documentación de la API](#-documentación-de-la-api)

## 🏗 Arquitectura del Sistema

La arquitectura separa las responsabilidades en dos servicios principales dockerizados, comunicados asíncronamente.

```mermaid
flowchart LR
    %% --- CONFIGURACIÓN VISUAL ---
    %% Curvas suaves para las líneas
    linkStyle default interpolate basis

    %% Definimos los estilos de los subgrafos para que sean contenedores visuales limpios
    %% fill:transparent hace que se integre con tu tema oscuro/claro
    classDef container fill:transparent,stroke:#888,stroke-width:1px,stroke-dasharray: 5 5;

    %% --- CAPAS DE LA ARQUITECTURA (STACK) ---

    subgraph UserLayer [📱 Capa de Cliente]
        direction TB
        Client((👤 Cliente))
    end

    subgraph ServiceLayer [⚡ Capa de API]
        direction TB
        API[🚀 API Gateway]
    end

    subgraph QueueLayer [🔄 Capa de Mensajería]
        direction TB
        Redis{⚡ Redis / BullMQ}
    end

    subgraph WorkerLayer [⚙️ Capa de Procesamiento]
        direction TB
        Worker[⚙️ Worker Processor]
    end

    subgraph DataLayer [💾 Capa de Persistencia]
        direction TB
        %% Mantenemos TB aquí para que MinIO y Postgres se apilen verticalmente
        %% al final de la línea, en lugar de extenderse demasiado a la derecha.
        MinIO[("🪣 MinIO (S3)")]
        Postgres[("🐘 PostgreSQL")]
    end

    %% Aplicamos estilo a los contenedores
    class UserLayer,ServiceLayer,QueueLayer,WorkerLayer,DataLayer container;

    %% --- FLUJO PRINCIPAL (Proceso de Imagen) ---

    %% 1. Ingesta
    Client -->|1. POST /jobs| API

    %% 2. Distribución
    API -->|2. Sube Imagen Raw| MinIO
    API -->|"3. Crea Job (Pending)"| Postgres
    API -->|4. Encola Job| Redis

    %% 3. Consumo
    Redis -->|5. Procesa Job| Worker

    %% 4. Procesamiento y Guardado
    Worker -->|6. Descarga Raw| MinIO
    Worker -->|7. Sube Procesada| MinIO
    Worker -->|"8. Actualiza (Completed)"| Postgres

    %% --- FLUJO SECUNDARIO (Lectura) ---
    Client -.->|9. Polling Status| API
    API -.->|10. Lee Estado| Postgres
```

1.  **API Service (Producer)**:
    - Punto de entrada RESTful construido con **Express**.
    - Valida peticiones y tipos de archivo utilizando **Zod**.
    - Sube la imagen "cruda" a **MinIO**.
    - Delega el procesamiento enviando un mensaje a la cola de **Redis**.

2.  **Worker Service (Consumer)**:
    - Servicio independiente que "escucha" nuevos trabajos.
    - Ejecuta transformaciones de imagen intensivas en CPU (redimensionamiento, conversión de formato) usando **Sharp**.
    - Gestiona el ciclo de vida del Job y actualiza el estado final en **PostgreSQL**.
    - Diseñado para escalar horizontalmente según la demanda.

## 🧩 Principios de Diseño

- **Separación de Responsabilidades (SoC):** La API solo gestiona peticiones HTTP; el Worker se encarga de la lógica de negocio pesada.
- **Código Compartido (Shared Kernel):** Uso de un módulo `shared` para tipos, esquemas de validación (Zod) y constantes, asegurando consistencia entre microservicios.
- **Fail Fast:** Validaciones estrictas al inicio del flujo para rechazar peticiones inválidas inmediatamente, ahorrando recursos de procesamiento.
- **Infraestructura Inmutable:** Todo el entorno (DB, Cache, Storage) está contenerizado con Docker, garantizando paridad entre desarrollo y producción.

---

## 🚀 Stack Tecnológico

- **Lenguaje:** TypeScript (Strict Mode)
- **Runtime:** Node.js
- **API Framework:** Express.js
- **ORM:** Prisma (PostgreSQL)
- **Colas:** BullMQ + Redis
- **Procesamiento de Imágenes:** Sharp
- **Validación:** Zod
- **Storage:** MinIO (AWS S3 Compatible)
- **Infraestructura:** Docker, Docker Compose

---

## ✨ Características Principales

- **Procesamiento Asíncrono Non-blocking:** La API responde en milisegundos (`202 Accepted`) devolviendo un Job ID, liberando al cliente mientras el servidor procesa en background.
- **Validación Estricta (Allowlist):** Seguridad por diseño, permitiendo solo formatos y dimensiones preestablecidas.

  **Formatos permitidos:**
  - `WEBP` (Default)
  - `JPEG`
  - `PNG`
  - `AVIF`

  **Dimensiones permitidas (WxH):**
  - `256x256`
  - `512x512`
  - `1024x1024`
  - `1920x1080`

- **Trazabilidad:** Persistencia de metadatos de trabajos en PostgreSQL para auditoría y seguimiento de estados (`queued`, `processing`, `completed`, `failed`).
- **Almacenamiento Escalable:** Uso de MinIO para simular un entorno de producción S3 real.

---

## 📂 Estructura del Proyecto

La estructura sigue una organización modular monorepo, centralizando la lógica compartida.

```plaintext
pixelforge/
├── src/
│   ├── api/                 # API REST (Producer)
│   │   ├── controllers/     # Controladores de endpoints
│   │   ├── middleware/     # Middlewares (Multer, ErrorHandler, etc.)
│   │   ├── routes/          # Definición de rutas v1
│   │   ├── services/        # Servicios de negocio (JobService, StorageService)
│   │   └── server.ts        # Entrypoint del servidor
│   ├── worker/              # Worker (Consumer)
│   │   ├── processors/      # Lógica de procesadores de Jobs
│   │   └── main.ts          # Entrypoint del Worker
│   │   └── worker.setup.ts  # Configuración del Worker
│   ├── shared/              # Núcleo Compartido
│   │   ├── repositories/    # Capa de acceso a datos y persistencia
│   │   ├── schemas/         # Esquemas Zod (JobSchema, EnvSchema)
│   │   ├── services/        # Servicios de negocio
│   │   ├── types/           # Definiciones de tipos TypeScript
│   │   └── prismaClient.ts  # Instancia singleton de Prisma
│   └── config/              # Archivos de configuración general
├── docs/                    # Documentación y colecciones Postman
├── docker-compose.yml       # Orquestación de servicios
├── Dockerfile.api           # Imagen optimizada para API
├── Dockerfile.worker        # Imagen optimizada para Worker
└── README.md
```

---

## 🛠 Instalación y Uso

### Prerrequisitos

- Docker y Docker Compose.

### Despliegue Local

1.  **Clonar el repositorio**:

    ```bash
    git clone https://github.com/daniieldz/pixelforge.git
    cd pixelforge
    ```

2.  **Configurar Variables de Entorno**:
    Copia el archivo de ejemplo para configurar tus variables locales.

    ```bash
    cp .env.example .env
    ```

    _El archivo `.env.example` ya contiene valores por defecto funcionales para el entorno de Docker local._

3.  **Iniciar servicios**:

    ```bash
    docker-compose up --build -d
    ```

    _Esto levantará API, Worker, Redis, Postgres y MinIO._

4.  **Verificar estado**:
    ```bash
    docker-compose ps
    ```

**Accesos:**

- **API:** http://localhost:3000
- **MinIO Console:** http://localhost:9001 (User/Pass definidos en `.env`)

---

## 📡 Documentación de la API

Se incluye una colección de Postman en `docs/pixelforge.postman_collection.json` para facilitar las pruebas.

### 1. Crear Trabajo (Subir Imagen)

- **Endpoint:** `POST /api/v1/jobs`
- **Content-Type:** `multipart/form-data`

| Key | Tipo | Descripción |
| :--- | :--- | :--- |
| `file` | File | Imagen a procesar (jpg, png). |
| `width` | Int | Ancho objetivo (ej: 1024). |
| `height` | Int | Alto objetivo (ej: 1024). |
| `format` | String | Formato de salida (webp, png, jpeg, avif). |

### 2. Consultar Estado

- **Endpoint:** `GET /api/v1/jobs/:id`

**Respuesta de Ejemplo (Completado):**

```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "result": {
    "url": "http://minio:9000/pixelforge-bucket/processed/imagen_1024x1024.webp",
    "processedAt": "2023-12-30T10:00:00Z"
  }
}
```

---

## 👤 Autor

Desarrollado por [Daniel Díaz](https://www.linkedin.com/in/daniiel-diazz).
