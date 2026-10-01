# Deolingo

Deolingo es una aplicación web para que hispanohablantes aprendan alemán de nivel A1 mediante una ruta de lecciones cortas, ejercicios con corrección inmediata, explicaciones de gramática y tarjetas de vocabulario con repetición espaciada.

## Funcionalidades

- Ruta progresiva de 10 unidades y 30 lecciones con desbloqueo secuencial.
- Ejercicios de traducción en ambas direcciones, opción múltiple, orden de palabras, completar frases y asociación.
- Corazones que se recuperan con el tiempo, rachas de actividad y puntos de experiencia (XP).
- Seis temas de gramática con explicaciones y práctica sin consumir corazones.
- Vocabulario por temas, tarjetas reversibles y repaso programado.
- Registro e inicio de sesión con correo y contraseña.

## Requisitos

- Node.js 20 o superior.
- npm.
- PostgreSQL 16 o superior (local, Docker o un servicio administrado).

## Instalación local

1. Instala las dependencias exactas del proyecto:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y configura sus variables:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL`: URL de PostgreSQL, por ejemplo `postgresql://usuario:contraseña@localhost:5432/deolingo?schema=public`.
   - `NEXTAUTH_SECRET`: secreto aleatorio para firmar sesiones. Genera uno con `openssl rand -base64 32`.
   - `NEXTAUTH_URL`: URL base de la aplicación; en local, `http://localhost:3000`.

   No compartas ni agregues `.env` al control de versiones.

3. Crea las tablas y carga el contenido:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

   El seed se puede ejecutar más de una vez: actualiza el contenido inicial por identificadores estables y no elimina datos de usuarios.

4. Inicia el servidor:

   ```bash
   npm run dev
   ```

   Abre <http://localhost:3000> y crea una cuenta.

Para levantar PostgreSQL localmente con Docker (cambia las credenciales por valores locales y mantén la URL en `.env`):

```bash
docker run --name deolingo-postgres \
  -e POSTGRES_USER=deolingo \
  -e POSTGRES_PASSWORD=elige-una-clave-local \
  -e POSTGRES_DB=deolingo \
  -p 5432:5432 \
  -d postgres:16-alpine
```

## Calidad y pruebas

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run build` necesita variables válidas de entorno. `npm run vercel-build` genera el cliente Prisma, aplica migraciones desplegadas y compila la aplicación.

## Estructura del proyecto

- `src/app`: páginas Next.js y rutas de API.
- `src/components`: shell adaptable, formularios y pantallas de aprendizaje.
- `src/lib/exercises`: esquemas de ejercicios y corrección sin dependencias de base de datos.
- `src/lib/data`: consultas y operaciones transaccionales de la aplicación.
- `src/lib/gamification.ts`: reglas puras de corazones, XP, rachas y desbloqueos.
- `src/lib/srs.ts`: algoritmo de repetición espaciada.
- `prisma/schema.prisma`: modelos y relaciones de PostgreSQL.
- `prisma/seed-data`: unidades, gramática y vocabulario inicial.

## Reglas de aprendizaje

- **Corazones:** cada lección empieza con hasta cinco corazones. Una respuesta incorrecta consume uno; se regenera uno por cada 30 minutos completos, hasta cinco. La práctica de gramática no los consume.
- **Racha:** la primera actividad del día inicia o continúa la racha. La actividad se calcula por día UTC; repetir una actividad durante el mismo día no suma otra jornada.
- **XP:** la primera finalización de una lección otorga su recompensa, más cinco XP si se completa sin errores. Las repeticiones otorgan cinco XP.
- **Repetición espaciada:** cada tarjeta usa una variante simplificada de SM-2. Las valoraciones 1, 3, 4 y 5 corresponden a «Otra vez», «Difícil», «Bien» y «Fácil». Las tarjetas vencidas se muestran antes que las nuevas.
- **Contenido:** actualiza o añade unidades, temas y palabras en `prisma/seed-data`. Mantén identificadores de semilla estables y valida los datos ejecutando `npm test`.

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Crea una base PostgreSQL compatible, por ejemplo con Vercel Storage/Neon, y añade las variables de entorno del proyecto.
3. Configura `DATABASE_URL` con la URL pooled `POSTGRES_PRISMA_URL`, añade `NEXTAUTH_SECRET` generado con `openssl rand -base64 32` y establece `NEXTAUTH_URL` en el dominio de producción.
4. Usa `npm run vercel-build` como comando de compilación.
5. Después de crear la base, carga el contenido una vez desde un entorno seguro con acceso a ella:

   ```bash
   DATABASE_URL="URL_DE_LA_BASE" npx prisma db seed
   ```

   No escribas la URL real en el repositorio ni en archivos versionados.

## Limitaciones conocidas

El inicio de sesión no incluye limitación de intentos. Para un despliegue público se recomienda añadir rate limiting distribuido y supervisión contra intentos automatizados.
