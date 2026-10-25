# Hourtz — Plataforma Web de Música (Tarea 2)

## 1. Integrantes del Equipo y Repositorio
* **Desarrolladores:** Rafael Garrido, Alberto Arriagada y Nicolás Zambrano.
* **Proyecto seleccionado:** Plataforma web de música (*Hourtz*).
* **Repositorio del proyecto:** [https://github.com/n1kog0d/ProyectoDesarrolloWeb-/tree/main](https://github.com/n1kog0d/ProyectoDesarrolloWeb-/tree/main)


## 2. Despliegue en AWS (EC2 + Elastic IP)
* **Dirección Elastic IP utilizada:** `34.198.31.152`
* **Enlace público al sitio web desplegado:** [http://34.198.31.152](http://34.198.31.152) (o [http://34.198.31.152/html/index_notLogged.html](http://34.198.31.152/html/index_notLogged.html))
* **Enlace público al archivo JSON de datos:** [http://34.198.31.152/Json/datos.json](http://34.198.31.152/Json/datos.json)
* **Enlace público al archivo JSON de usuarios:** [http://34.198.31.152/Json/users.json](http://34.198.31.152/Json/users.json)


## 3. Descripción del Proyecto
**Hourtz** es una aplicación web frontend interactiva orientada al descubrimiento y reproducción de música en línea. Permite a los usuarios explorar un catálogo de géneros y canciones, escuchar pistas de audio directamente en el navegador, armar una cola de reproducción interactiva en un reproductor lateral deslizante, gestionar playlists personalizadas y editar su perfil de usuario.

En esta segunda etapa, el proyecto separa los datos estáticos en archivos JSON (`datos.json` y `users.json`), los carga asincrónicamente mediante `fetch()` e incorpora **Alpine.js** para gestionar de forma reactiva el estado de la interfaz, los listados dinámicos, el filtrado en tiempo real, la visualización condicional y la validación de formularios sin recargar la página.


## 4. Tecnologías Utilizadas y Forma de Incorporar Alpine.js
* **HTML5:** Estructura semántica de las vistas y directivas declarativas de Alpine.js.
* **CSS3 y Bootstrap 5.3.8:** Diseño visual con variables CSS personalizadas (`:root`), sistema de grillas responsivo, modales (`Modal`), alertas (`Toast`) y panel lateral deslizante (`Offcanvas`).
* **JavaScript (ES6+):** Consumo de datos mediante `fetch()`, API `Audio` de HTML5, y capa central de sesión/persistencia local en `javascript/funciones.js`.
* **Alpine.js 3.14.1:** Incorporado mediante CDN en las páginas HTML con el atributo `defer`:
  ```html
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"></script>
  ```
  Se utiliza definiendo funciones de componente (`catalogoApp()`, `homeApp()`, `perfilApp()`) vinculadas con `x-data` y `x-init="init()"` en la etiqueta `<body>`.


## 5. Estructura General de Carpetas

ProyectoDesarrolloWeb-/
├── audios/                 # Pistas de audio (.mp3) utilizadas por el catálogo y el reproductor
├── css/
│   └── estilos.css         # Hoja de estilos principal y variables de paleta de colores (:root)
├── html/
│   ├── index_notLogged.html # Página de bienvenida pública (sin sesión iniciada)
│   ├── Index_logged.html    # Panel principal interactivo estilo Spotify + Reproductor lateral (Alpine.js)
│   ├── catalogo.html        # Catálogo interactivo de géneros musicales con filtro en vivo (Alpine.js)
│   ├── perfil.html          # Vista de perfil de usuario y formulario modal reactivo (Alpine.js)
│   ├── playlist.html        # Gestión de playlists del usuario (crear, ver, agregar/quitar canciones)
│   ├── login.html           # Formulario de inicio de sesión simulado
│   └── register.html        # Formulario de registro de nuevas cuentas locales
├── img/                    # Portadas de canciones, artistas, avatares e íconos (.jpg, .png, .webp)
├── javascript/
│   └── funciones.js        # Lógica compartida de sesión, almacenamiento local y utilidades
├── Json/
│   ├── datos.json          # Catálogo estático de canciones y géneros musicales
│   └── users.json          # Usuarios de prueba predefinidos con sus preferencias y playlists
└── README.md               # Documentación del proyecto


## 6. Funcionalidades Agregadas en la Tarea 2
1. **Catálogo Reactivo con Alpine.js (`catalogo.html`):** Carga asincrónica de los 12 géneros musicales desde `Json/datos.json` con `fetch()`, renderizado dinámico con `x-for` y `:key`, filtrado instantáneo con `x-model="busqueda"`, reproducción de audio reactiva y manejo visual de estados de carga (`cargando`), error (`error`) y búsqueda sin resultados.
2. **Dashboard Principal Logueado y Reproductor Deslizante (`Index_logged.html`):**
   * Saludo dinámico según la hora del sistema y el nombre del usuario activo.
   * Sección de ayuda desplegable mediante `x-show="mostrarAyuda"`.
   * Listado dinámico de canciones recomendadas y playlists del usuario mediante `x-for`.
   * Buscador superior reactivo (`x-model="busquedaNav"`) que permite reproducir canciones al instante o sumarlas a la cola (`+ Cola`).
   * **Reproductor Lateral (`Offcanvas`):** Gestionado con Alpine.js; incluye cola de reproducción dinámica (inicia vacía, permite agregar canciones una a una, quitar canciones individuales o vaciar toda la cola), reproducción de playlists completas, controles de Anterior, Play/Pausa, Siguiente, Modo Aleatorio (`🔀`), barra de progreso y control de volumen con botón de silencio (`Mute`).
3. **Formulario Interactivo de Edición de Perfil (`perfil.html`):** Modal controlado con Alpine.js mediante `@submit.prevent="guardarCambios()"` y vinculación de campos con `x-model` (`form.nombre`, `form.sobreMi`). Valida campos obligatorios y longitudes mínimas mostrando mensajes de error o confirmación con `x-show` sin recargar la página.


## 7. Ubicación y Estructura del Archivo JSON
Los datos principales se encuentran en `Json/datos.json`, estructurados en dos colecciones (`canciones` y `generos`), cada una con más de 5 registros e identificador único (`id`):

```json
{
  "canciones": [
    {
      "id": 1,
      "titulo": "Bohemian Rhapsody",
      "artista": "Queen",
      "genero": "Rock",
      "audio": "../audios/rock.mp3",
      "imagen": "../img/queen.jpg"
    }
  ],
  "generos": [
    {
      "id": 1,
      "nombre": "Rock",
      "descripcion": "Las mejores canciones de rock.",
      "audio": "../audios/rock.mp3",
      "imagen": "../img/queen.jpg"
    }
  ]
}
```
Adicionalmente, `Json/users.json` almacena usuarios semilla de prueba para demostrar la carga de perfiles y playlists preexistentes.


## 8. Flujo de Carga y Filtrado de los Datos
1. **Carga inicial (`fetch`):** Al abrir `catalogo.html` o `Index_logged.html`, la directiva `x-init="init()"` ejecuta una petición `fetch('../Json/datos.json')`.
2. **Almacenamiento en memoria del componente:** La respuesta JSON se guarda en el estado reactivo de Alpine (`this.generos` en el catálogo y `this.catalogo` en el inicio).
3. **Filtrado reactivo en memoria:** Cuando el usuario escribe en el campo de búsqueda vinculado con `x-model`, una propiedad computada (`get filtrados()` en `catalogo.html` y `get resultadosNav()` en `Index_logged.html`) convierte el término a minúsculas (`.toLowerCase().trim()`) y filtra el arreglo que ya está en memoria sin volver a solicitar el archivo JSON al servidor. Al borrar el texto del input, se restaura automáticamente el listado completo.


## 9. Instrucciones de Prueba

### A. Probar el Listado y la Búsqueda (`x-for` y `x-model`)
1. Ingresar a `html/catalogo.html`. Se mostrará el listado de 12 géneros musicales cargados desde `datos.json`.
2. Escribir en el campo *"Filtrar géneros por nombre..."* un término con mayúsculas o minúsculas (ej. `ROCK` o `chilena`) para ver cómo se filtra en tiempo real.
3. Escribir un texto inexistente (ej. `xyz123`) para visualizar el mensaje de *"Sin resultados"* y presionar el botón **"Limpiar búsqueda"** para recuperar todos los registros.
4. En `html/Index_logged.html`, escribir en la barra superior de navegación para filtrar canciones por título, artista o género y presionar **`+ Cola`** para añadirlas al reproductor lateral.

### B. Probar la Sección que se Muestra u Oculta (`x-show`)
1. Ingresar a `html/Index_logged.html`.
2. En la parte superior derecha (junto al saludo de bienvenida), hacer clic en el botón **"❓ Cómo usar el reproductor"**.
3. Se desplegará el cuadro de guía rápida mediante `x-show="mostrarAyuda"`. Al volver a presionarlo (*"Ocultar ayuda"*), se ocultará sin recargar la página.

### C. Probar el Formulario Interactivo (`x-model` y `@submit.prevent`)
1. Iniciar sesión en `html/login.html` (por ejemplo, con el usuario de prueba `nicolasz@gmail.com` / contraseña `N1c0_2026`, o registrando una cuenta nueva en `register.html`).
2. Ir a la pestaña **Perfil** (`html/perfil.html`) y hacer clic en el botón **"Editar Perfil"**.
3. Dejar vacío el campo *"Nombre visible"* o escribir menos de 10 caracteres en *"Sobre mí"* y presionar **"Guardar Cambios"**: se mostrará una alerta roja con el mensaje de validación correspondiente.
4. Completar un nombre válido (3+ caracteres) y una biografía válida (10+ caracteres) y presionar **"Guardar Cambios"**: los datos del perfil se actualizarán inmediatamente en pantalla sin recargar la página y se mostrará un mensaje verde de confirmación.

### D. Instrucciones para Comprobar el Estado de Error de Carga
Para verificar el mensaje de error cuando falla la obtención o lectura de `datos.json` en `html/catalogo.html`:
* **Opción 1 (Desde las herramientas de desarrollador del navegador):** Abrir DevTools (`F12`) → pestaña **Red (Network)** → hacer clic derecho sobre la petición `datos.json` y seleccionar **"Bloquear URL de solicitud" (Block request URL)** (o activar el modo *Offline*), y recargar la página. Se mostrará la alerta roja de error junto con el botón **"Reintentar"**.
* **Opción 2 (En entorno local):** Renombrar temporalmente el archivo `Json/datos.json` (por ejemplo a `datos_temp.json`) y abrir `catalogo.html` para observar el estado de error y probar el botón **"Reintentar"**.


## 10. Limitaciones Conocidas y Persistencia
* **Sin Backend ni Base de Datos real:** El archivo `Json/datos.json` es un recurso estático de solo lectura; `fetch()` no permite escribir cambios en el servidor.
* **Qué se pierde al recargar la página:** La cola de reproducción activa en el reproductor lateral, la canción en curso, el progreso del audio y los filtros de búsqueda escritos en los inputs viven únicamente en la memoria de Alpine.js y se reinician al refrescar la pestaña (`F5`).
* **Uso de `sessionStorage` y `localStorage`:** La sesión activa (`usuarioActivo`) se guarda en `sessionStorage` (se cierra al cerrar el navegador o cerrar sesión). Las cuentas creadas desde el formulario de registro y las ediciones del perfil/playlists se guardan localmente en el `localStorage` de ese navegador específico para mejorar la experiencia de prueba, pero **no se almacenan en el servidor** ni constituyen un sistema de autenticación o seguridad real.