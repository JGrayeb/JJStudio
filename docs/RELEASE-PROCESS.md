# Publicaciones de JJStudio sin regresiones

## Estado de esta preparación

La carpeta site/ es la fuente canónica preparada, derivada de la versión de precios regulares publicada como dpl_9UMqZFk5SYcxj3d6YpVTKP1rHiiq. El resto del checkout se conserva: no publicar la raíz ni volver a una copia antigua de .codex_build.

La preparación local no activa por sí sola CI. El 25 de noviembre se verificó Root Directory=site en Vercel; autoAssignCustomDomains continúa en true por decisión del usuario. Falta observar el control remoto del commit exacto antes de declarar CI activo. Los scripts locales no hacen push, despliegan ni cambian dominios.

La metadata Git de las publicaciones manuales anteriores puede indicar un commit histórico aunque la fuente haya cambiado después. NO usar ese SHA como prueba de igualdad. El sourceSha256 y la lista completa del manifiesto identifican esta fuente; después de guardarla en Git, registrar también el commit exacto nuevo.

## Destino único

- Equipo: jjs-tudio-s-projects / team_DBehXwhISvWA7AVhQ5CBL7pS.
- Proyecto: jj-studio / prj_rrKx2yBYJb9Uoo1f2gtzFjnFdePM.
- Fuente Git: Root Directory site, aprobado y comprobado el 25 de noviembre. Production usa la rama main; una rama codex/ solo debe crear Preview.
- Node.js Vercel: 24.x; validación reproducible: 24.16.0.
- Dependencias: npm ci usa versiones exactas e integridad del lockfile. No se cambiaron versiones ni se instala latest.

## Revisar y preparar sin publicar

1. Trabajar únicamente en site/. Conservar sin sobrescribir los cambios pendientes de la raíz.
2. Revisar el diff, pruebas y cambios de precios, pagos, permisos o migraciones. Las migraciones no se aplican automáticamente al publicar.
3. Desde site, ejecutar: npm run release:manifest -- --reviewed. Escribe release/reviewed-source.json fuera de la app: rutas, tamaños y SHA-256, sin contenido personal. Este archivo sí se versiona en Git.
4. Ejecutar npm run release:validate. Comprueba destino/manifiesto, credenciales evidentes, allowlist, lockfile, carga de next.config.js como Production, cron de avisos, pruebas, tipos y build. No abre Checkout ni llama a Stripe/Supabase.
5. Ejecutar npm run release:stage. Crea una copia local verificada .release/stage-HASH, sin sobrescribir preparaciones previas. Esa raíz es un sobre de publicación: contiene site/ con los archivos runtime revisados, una .vercelignore generada y el enlace validado .vercel/project.json. No copia la aplicación heredada de la raíz, tests, fixtures, scripts, snapshots, .env, cachés ni datos. No ejecuta Vercel.
6. Si cambió cualquier archivo después de revisar, el gate falla. No regenerar el manifiesto para ocultar un fallo: revisar el diff y repetir los controles.

sourceSha256 incluye tests y scripts de revisión. deploySha256 identifica los archivos runtime relativos a la app. uploadSha256 identifica además su ubicación dentro de site/ y la .vercelignore generada en el sobre. Un test nuevo también requiere actualizar la revisión. El hash demuestra igualdad; no sustituye la revisión humana. El scanner es una defensa adicional, no una certificación de ausencia de cualquier dato sensible.

El destino revisado exige Root Directory site. El stage no sirve para un proyecto configurado con raíz ".". Antes de subir se debe comprobar que Vercel conserva rootDirectory=site y el equipo/proyecto correctos. No se cambia autoAssignCustomDomains: permanece en su valor autorizado; un Preview no asigna el dominio de producción.

## Preview autorizado

La preparación local no autoriza publicar. Cuando esté autorizado:

1. Inmediatamente antes de usar Vercel, desde site ejecutar npm run release:verify-stage -- RUTA-EXACTA-DEL-STAGE. Revisa cada archivo, los hashes, archivos extra/faltantes, el enlace de proyecto y el comprobante contra la fuente revisada actual. La carpeta es una copia verificable, no un contenedor inmutable: cualquier edición invalida la comprobación y no se debe desplegar.
2. Usar la raíz del stage exacto, NO su subcarpeta site, y ejecutar vercel project inspect --non-interactive --scope jjs-tudio-s-projects desde allí. Detenerse si no coinciden equipo/proyecto, Root Directory site o pide vinculación. No modificar el stage después de verificarlo. Ejecutar también vercel deploy --dry --json --local-config site/vercel.json y comparar la lista real con stageUploadFiles del manifiesto usando validateUploadInventory. Debe incluir site/app/, site/components/, site/content/, site/lib/, site/public/ y la .vercelignore del sobre. Debe excluir la raíz heredada, pruebas, fixtures, datos y .vercel/project.json. Un test local del manifiesto no sustituye comprobar la lista real del CLI.
3. Crear únicamente Preview desde la raíz del sobre, con --local-config site/vercel.json para conservar la configuración revisada, incluidos los avisos programados. Usar título descriptivo y metadata sourceSha256/deploySha256/uploadSha256. Conservar protección. No usar --prod ni promover.
4. Registrar ID, URL, ambos hashes, commit real si existe, título y resultados. Verificar el mismo Preview con lecturas y datos ficticios, sin cargos.
5. Entregar el enlace y esperar aprobación antes de Production.

## Production y reversión

Con aprobación independiente, preparar un candidato Production con --skip-domain y verificar ese build antes de promoverlo. Promover un Preview puede recompilar con otras variables: no equivale a promover un candidato Production ya verificado.

Antes de promover registrar el ID que tiene www.jjstudio.mx y el nuevo ID. Una reversión usa el ID anterior exacto y requiere autorización: no improvisar una versión por fecha/título. Revertir código no revierte migraciones ni datos. No cambiar cobros, saldos o el cierre de las 5 a. m. para solucionar un deploy.

## Activación remota pendiente

1. Revisar y guardar site/, el manifiesto revisado y el workflow en un commit limpio y acotado. Nunca incluir datos locales o credenciales.
2. Acordar la rama oficial y transición de Root Directory a site. No hacer push a una rama con publicación automática sin comprobar efectos.
3. Ejecutar Verify JJStudio en GitHub para ese commit y observar su resultado; ese workflow llama al validador canónico.
4. Configurarlo como comprobación requerida y comprobar Deployment Checks en Vercel antes de activar publicación automática.
5. Crear el primer Preview desde la fuente oficial y comprobar hashes. Solo entonces cerrar estabilización.

El workflow histórico Verify JJStudio (ci.yml) conserva su nombre y el check final verify, pero ya no instala ni ejecuta la aplicación heredada de la raíz. Llama a la única definición canónica reutilizable (site-validation.yml), con Node 24, manifiesto revisado, pruebas, tipos y build desde site/. El check final falla si la validación falla, se omite o se cancela; la mera ejecución del workflow no acredita éxito.

ci.yml se ejecuta en pull requests, pushes y solicitudes manuales. No usa filtros de rutas, para que un check requerido no quede pendiente por haberse omitido. site-validation.yml solo se llama desde ese workflow o de forma manual: no añade otra ejecución automática duplicada. Ambos tienen contents:read, no usan credenciales operativas ni hacen despliegues; las acciones externas del validador están fijadas por SHA. El workflow independiente de uptime se conserva sin cambios.

Esta adaptación está preparada localmente. Para activarla y cerrar el punto:

1. Subir el commit revisado a una rama no productiva, después de comprobar que Vercel no publicará esa rama.
2. En GitHub Actions, observar el workflow Verify JJStudio para el SHA exacto. Deben terminar correctamente el validador canónico y el check final verify.
3. En la protección de la rama oficial, conservar o exigir el check verify, cuyo contexto histórico no se ha cambiado. Seleccionar el check que GitHub muestre para esta ejecución, no adivinar el contexto compuesto del job reutilizable.
4. Mantener revisión de cambios obligatoria y no fusionar ni promover a Production hasta su aprobación independiente.
5. Verificar la raíz site y el primer Preview de la integración Git antes de declarar la transición terminada.

La asignación automática de dominios se conserva. La aprobación manual se realizará antes de fusionar una PR a main o de promover un candidato en Vercel: cualquiera de esas acciones puede publicar. No fusionar main solo para activar CI. Exigir verify y una PR en la protección de main evita que un push directo omita esa revisión; no convierte un deploy manual de Vercel en un flujo automáticamente validado.

La lista permitida está implementada por release-stage y release-verify-stage. .vercelignore añade exclusiones, pero no usa una exclusión global con negaciones para reabrir directorios: ese patrón dejó fuera app/ con el CLI de Vercel y produjo un Preview fallido. No volver a publicar sin comprobar el inventario del dry-run real y el build remoto.

La carpeta .release está ignorada por Git para evitar subir stage/cachés. El manifiesto revisado se guarda separadamente en release/reviewed-source.json, contiene solo rutas/hashes de código y sí se añade al commit de transición.
