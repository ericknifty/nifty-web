---
title: Sistema base para portafolio, blog y demos
slug: sistema-portafolio-web
area: web
date: 2026-04-08
summary: Un proyecto semilla para organizar contenido, diseño y publicación en una sola estructura clara.
cover: /media/images/project-web.svg
gallery:
  - /media/images/project-web.svg
  - /media/images/post-editorial.svg
tags:
  - arquitectura
  - contenido
  - deploy
downloads: []
videoUrl: https://vimeo.com/148751763
lottieFile: ""
featured: true
draft: false
---

Este proyecto funciona como punto de partida para todo el sitio. No es solo un layout: define cómo se relacionan el CMS, GitHub, Astro y el hosting.

## Piezas del sistema

- **Pages CMS** para editar el contenido desde navegador.
- **GitHub** para guardar historial y activar automatizaciones.
- **Astro** para construir HTML, CSS y JS estático.
- **Hosting compartido** para servir el sitio final.

## Por qué sirve como base

La ventaja de esta estructura es que cada parte tiene un rol fácil de entender. Si algo falla, es más simple detectar si el problema viene del contenido, del build o del deploy.
