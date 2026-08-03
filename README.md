# JJStudio

Sitio oficial de JJ Studio Lagree en Querétaro, construido con Next.js y publicado en Vercel.

## Desarrollo local

Requisitos:

- Node.js 22
- npm

```bash
npm ci
npm run dev
```

Abre `http://localhost:3000`.

El sitio público no necesita variables de entorno. El archivo `.env.example` documenta este estado y deberá actualizarse si se agrega una integración futura.

## Verificación

Antes de publicar cualquier cambio:

```bash
npm run check
```

Este comando ejecuta pruebas de contenido, TypeScript y el build de producción.

## Contenido comercial

Los datos que cambian con más frecuencia viven en `content/site-content.json`:

- enlaces oficiales;
- oferta y código promocional;
- paquetes de clases;
- presentaciones y precios de bebidas;
- precios de calcetines.

La portada y la página de bebidas leen ese archivo. Las demás páginas no dependen de estos valores.

## Rutas públicas

- `/` — portada
- `/beverages` — bebidas
- `/horarios` — calendario de Nessty
- `/metodo-lagree` — método Lagree
- `/sobre-nosotros` — equipo

Las reservaciones y cuentas se administran en Nessty. El antiguo sistema interno de login, clases y dashboards fue retirado para reducir mantenimiento y superficie de ataque.

## Publicación

1. Crear los cambios en una rama.
2. Abrir o actualizar el pull request.
3. Revisar el preview del proyecto correcto de Vercel: `jj-studio`.
4. Ejecutar `npm run check` y revisar el check de Vercel.
5. Fusionar a `main` únicamente después de aprobar el preview.

El dominio canónico es `https://www.jjstudio.mx`.

## Recursos visuales

- Fotos del estudio: `public/images/estudio`
- Bebidas: `public/images/bebidas`
- Coaches: `public/images`
- Video principal: `public/videos`

Las imágenes se muestran con `next/image`; conserva nombres descriptivos y evita reemplazar archivos sin verificar el preview móvil y de escritorio.
