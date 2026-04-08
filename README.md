# Web Nifty

Sitio personal construido con `Astro + GitHub + Pages CMS + hosting compartido`, pensado para ser rápido, editable y fácil de entender.

## Qué trae esta base

- Blog con posts en `src/content/posts`
- Portafolio con proyectos en `src/content/projects`
- Utilidades/demos en `src/content/tools`
- Páginas fijas editables: `inicio`, `sobre-mi`, `cv`
- Subida de imágenes, descargas, video y archivos Lottie
- Flujo de build y deploy con GitHub Actions

## Cómo se entiende el flujo completo

1. Entras a **Pages CMS** y editas un post, proyecto o página.
2. Pages CMS guarda ese cambio como un archivo real dentro del repo en GitHub.
3. GitHub detecta el cambio y ejecuta un workflow.
4. Astro lee el contenido, compila el sitio y genera la carpeta `dist/`.
5. El workflow de deploy sube `dist/` a tu hosting compartido.

## Estructura del proyecto

```text
/
├─ public/
│  ├─ media/
│  │  ├─ images/
│  │  ├─ downloads/
│  │  └─ video/
│  ├─ lottie/
│  └─ favicon/
├─ src/
│  ├─ assets/
│  │  └─ brand/
│  ├─ components/
│  ├─ layouts/
│  ├─ lib/
│  ├─ pages/
│  ├─ styles/
│  ├─ content/
│  │  ├─ posts/
│  │  ├─ projects/
│  │  ├─ tools/
│  │  ├─ pages/
│  │  └─ settings/
│  └─ content.config.ts
├─ .github/workflows/
├─ .pages.yml
├─ astro.config.mjs
└─ package.json
```

## Carpetas clave

- `src/content/`: contenido editable del sitio.
- `src/components/`: piezas visuales reutilizables.
- `src/layouts/`: estructura base de páginas.
- `src/lib/`: helpers para contenido y media.
- `public/media/`: archivos subidos desde el CMS que deben conservarse tal cual.
- `public/lottie/`: animaciones `.json` usadas en frontend.

## Cómo instalar localmente

Recomendado: `Node 22`.

Luego:

```bash
npm install
npm run dev
```

Comandos útiles:

```bash
npm run dev
npm run build
npm run preview
npm run check
```

### Validación del build final

- `npm run build` genera la carpeta `dist/`
- `npm run preview` sirve exactamente ese build final en local
- Si `preview` se ve bien, el resultado que subirás al hosting debería coincidir visualmente

## Cómo editar contenido

### Posts

- Ruta: `src/content/posts`
- Se editan desde Pages CMS o manualmente como Markdown.
- Campos principales: título, slug, fecha, categoría, extracto, portada, tags, video, descargas, cuerpo.

### Proyectos

- Ruta: `src/content/projects`
- Sirven para el portafolio filtrado por área.
- Campos principales: área, resumen, portada, galería, video, Lottie, descargas y cuerpo.

### Utilidades

- Ruta: `src/content/tools`
- Sirven para demos internas o enlaces externos.

### Páginas fijas

- `src/content/pages/inicio.md`
- `src/content/pages/sobre-mi.md`
- `src/content/pages/cv.md`

### Ajustes globales

- `src/content/settings/site.json`
- Aquí cambias nombre del sitio, CTA, email, redes y descripciones base.

## Cómo funciona Pages CMS

El archivo `.pages.yml` define:

- Qué colecciones existen
- Qué campos tiene cada tipo de contenido
- Dónde se guardan imágenes, descargas, videos y Lottie
- Qué páginas fijas se pueden editar sin tocar código

Media configurada:

- `public/media/images`
- `public/media/downloads`
- `public/media/video`
- `public/lottie`

## Lottie

Los archivos `.json` se guardan en `public/lottie`.

El componente reutilizable está en:

- `src/components/LottiePlayer.astro`

Uso esperado:

- Subes el archivo desde Pages CMS
- El CMS guarda la ruta
- La página del proyecto o utilidad renderiza la animación

## GitHub Actions

### Build

Archivo:

- `.github/workflows/build.yml`

Se ejecuta en `push`, `pull_request` y `workflow_dispatch`.

### Deploy

Archivo:

- `.github/workflows/deploy.yml`

Solo se ejecuta si existen estos secretos:

- `DEPLOY_HOST`
- `DEPLOY_USERNAME`
- `DEPLOY_PASSWORD`
- `DEPLOY_PROTOCOL`
- `DEPLOY_PORT`
- `DEPLOY_REMOTE_DIR`

También conviene definir esta variable de repositorio:

- `SITE_URL`

Valores recomendados:

- `DEPLOY_PROTOCOL`: `sftp`
- `DEPLOY_PORT`: `22`
- `DEPLOY_REMOTE_DIR`: `public_html`
- `SITE_URL`: `https://tudominio.cl`

## Qué sí subir a GitHub

Estos archivos y carpetas sí deben ir al repo:

- `src/`
- `public/`
- `.github/`
- `.pages.yml`
- `package.json`
- `package-lock.json`
- `astro.config.mjs`
- `tsconfig.json`
- `.nvmrc`
- `.env.example`
- `README.md`

## Qué no subir a GitHub

Esto debe quedar fuera del repo:

- `node_modules/`
- `dist/`
- `.astro/`
- `.env`
- `.env.*`
- logs temporales
- configuración local del editor como `.vscode/` o `.idea/`

## Paso a paso para subir a GitHub

1. Crea un repo vacío en GitHub.
2. En tu carpeta del proyecto agrega el remoto:

```bash
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
```

3. Revisa el estado:

```bash
git status
```

4. Agrega todo lo versionable:

```bash
git add .
```

5. Crea el primer commit:

```bash
git commit -m "feat: initial Astro portfolio base"
```

6. Sube la rama principal:

```bash
git push -u origin main
```

## Paso a paso para dejar listo el deploy al hosting

1. Confirma si tu hosting soporta `SFTP`. Si sí, usa eso.
2. En GitHub abre `Settings > Secrets and variables > Actions`.
3. Crea estos secretos:

- `DEPLOY_HOST`
- `DEPLOY_USERNAME`
- `DEPLOY_PASSWORD`
- `DEPLOY_PROTOCOL`
- `DEPLOY_PORT`
- `DEPLOY_REMOTE_DIR`

4. Valores típicos:

- `DEPLOY_PROTOCOL=sftp`
- `DEPLOY_PORT=22`
- `DEPLOY_REMOTE_DIR=public_html`

5. En `Settings > Secrets and variables > Actions > Variables`, crea:

- `SITE_URL=https://tudominio.cl`

6. Haz un push a `main`.
7. Revisa `Actions` en GitHub y confirma que `Build site` y `Deploy to hosting` terminen bien.

## Paso a paso para conectar Pages CMS

1. Sube primero el repo a GitHub.
2. Entra a Pages CMS y autentica tu cuenta de GitHub.
3. Selecciona este repositorio.
4. Pages CMS detectará el archivo `.pages.yml`.
5. Verifica que aparezcan estas secciones:

- Ajustes del sitio
- Página de inicio
- Página Sobre mí
- Página CV
- Posts
- Proyectos
- Utilidades

6. Haz una prueba creando un post nuevo con:

- título
- slug
- portada
- cuerpo
- una descarga opcional

7. Guarda el cambio y confirma:

- que GitHub recibió un commit
- que el workflow de build se ejecutó
- que el nuevo contenido aparece en el sitio

## Checklist final

- `npm run dev` funciona
- `npm run build` funciona
- `npm run preview` funciona
- el repo está subido a GitHub
- `SITE_URL` está configurado
- los secretos del deploy están cargados
- Pages CMS abre el repo y permite editar contenido
