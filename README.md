# Hourtz — Plataforma Web de Música (Tarea 2)

## 1. Integrantes del Equipo y Repositorio
* **Desarrolladores:** Rafael Garrido, Alberto Arriagada y Nicolás Zambrano.
* **Proyecto seleccionado:** Plataforma web de música (*Hourtz*).
* **Repositorio del proyecto:** [https://github.com/n1kog0d/ProyectoDesarrolloWeb-/tree/main](https://github.com/n1kog0d/ProyectoDesarrolloWeb-/tree/main)

## 2. Despliegue en AWS (EC2 + Elastic IP)
* **Dirección Elastic IP utilizada:** `34.198.31.152`
* **Enlace público al sitio web desplegado:** [http://34.198.31.152](http://34.198.31.152) 
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
'''text
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
'''

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
Los datos de prueba principales se encuentran en `Json/datos.json`, estructurados en dos colecciones (`canciones` y `generos`), cada una con más de 10 registros e identificador único (`id`):

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
Adicionalmente, `Json/users.json` almacena usuarios de prueba para demostrar la carga de perfiles y playlists preexistentes.

## 9. Instrucciones de Prueba

### A. Probar datos del users.json (`x-model` y `@submit.prevent`)
1. Iniciar sesión en `html/login.html` (por ejemplo, con el usuario de prueba `jonathanfz@gmail.com` / contraseña `JuanDu4rt3_<3`, o registrando una cuenta nueva en `register.html`).

### B. Búsquedas
1. Se puede hacer búsqueda de canciones en la barra de búsqueda de la Navbar, en el apartado de Playlist y se puede filtrar por género en el apartado de Catálogo. 

## 10. Easter Egg Doom
1. Una vez con la sesión iniciada (ya sea por una cuenta de users.json o por una cuenta recien creada en el registro) y estemos en la pagina de inicio, en la esquina inferior derecha hacer click 3 veces rápido (3 clicks en menos de 1,5 segundos) y se abrirá una pestaña con un emulador del DOOM. **Solo funciona en el "index_logged.html", así que si o si tener una cuenta es necesario. 

## 11. Limitaciones
* **Sin Backend ni Base de Datos real:** El archivo `Json/datos.json` es un recurso estático de solo lectura; `fetch()` no permite escribir cambios en el servidor.
* **Qué se pierde al recargar la página:** La cola de reproducción activa en el reproductor lateral, la canción en curso, el progreso del audio y los filtros de búsqueda escritos en los inputs viven únicamente en la memoria de Alpine.js y se reinician al refrescar la pestaña (`F5`).
* **Uso de `sessionStorage` y `localStorage`:** La sesión activa (`usuarioActivo`) se guarda en `sessionStorage` (se cierra al cerrar el navegador o cerrar sesión). Las cuentas creadas desde el formulario de registro y las ediciones del perfil/playlists se guardan localmente en el `localStorage` de ese navegador específico para mejorar la experiencia de prueba, pero **no se almacenan en el servidor** ni constituyen un sistema de autenticación o seguridad real.
