# Deolingo

Deolingo es una aplicación web para que hispanohablantes aprendan alemán desde A1 hasta B2.2 mediante una ruta de lecciones cortas, ejercicios con corrección inmediata, explicaciones de gramática y tarjetas de vocabulario con repetición espaciada.

## Funcionalidades

- Ruta de 15 unidades y 45 lecciones organizadas por nivel, con desbloqueo secuencial.
- Ejercicios de traducción en ambas direcciones, opción múltiple, orden de palabras, completar frases y asociación.
- Corazones que se recuperan con el tiempo, rachas de actividad y puntos de experiencia (XP).
- 28 temas de gramática repartidos de A1 a B2.2 y filtrados por nivel en la sección de Gramática, con explicaciones y práctica sin consumir corazones.
- Vocabulario por temas, tarjetas reversibles y repaso programado.
- Registro e inicio de sesión con correo y contraseña.

## Niveles de alemán

La ruta ofrece A1 (Principiante), A2 (Básico), B1.1 (Intermedio I), B1.2 (Intermedio II), B2.1 (Intermedio alto I) y B2.2 (Intermedio alto II). Puedes elegir cualquier nivel; cada uno comienza con su primera lección desbloqueada.

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

## Despliegue con Supabase + Vercel

1. En Supabase, abre **Connect → ORMs → Prisma** y copia las cadenas del pooler de transacciones y del pooler de sesión.
2. En Vercel, configura `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET` y `NEXTAUTH_URL` tanto para **Production** como para **Preview**. Usa la URL adecuada para cada entorno en `NEXTAUTH_URL`.
3. `DATABASE_URL` debe usar el pooler de transacciones de Supabase (puerto `6543`) e incluir `?pgbouncer=true&connection_limit=1`. `DIRECT_URL` se usa para migraciones y debe usar el pooler de sesión (puerto `5432`). El host directo `db.<ref>.supabase.co` puede ser solo IPv6; usa el pooler de sesión para que las migraciones desde Vercel puedan conectarse.
4. El script `vercel-build` ejecuta `prisma generate`, `prisma migrate deploy`, `prisma db seed` y `next build`. Las migraciones y el contenido inicial se aplican automáticamente en cada despliegue; la semilla usa upserts idempotentes.

Para Vercel Postgres, Neon u otro proveedor, usa la URL pooled en `DATABASE_URL` y configura `DIRECT_URL` con la URL no pooled. En Docker local, ambas variables pueden usar la misma URL de PostgreSQL en `localhost:5432`. No guardes credenciales reales en archivos versionados.

## Limitaciones conocidas

El inicio de sesión no incluye limitación de intentos. Para un despliegue público se recomienda añadir rate limiting distribuido y supervisión contra intentos automatizados.
