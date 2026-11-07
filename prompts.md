# Prompts

Herramienta de IA usada: Claude (Anthropic), en una sola conversación.
Estos son los prompts que escribí, en orden, con el propósito de cada uno y el
resultado.

## 1. Planteamiento del problema
Propósito: Definir el stack tecnológico, la arquitectura del proyecto y los modelos de la base de datos relacional con Sequelize.

Prompt:
"me ayudas con este problema de desarrollo web, serie 2, Construya una aplicacion
web para reservar salas de una biblioteca. stack obligatorio: Node.js + Sequelize
(DB a eleccion) en el backend, react basico en el frontend, y sesion mediante
cookies." (pegué el enunciado completo con requisitos, entregables y rúbrica)

Propósito: obtener un plan de trabajo.
Resultado: un plan en pasos (backend, frontend, documentos), el stack
(Express + Sequelize + SQLite + express-session + React con Vite) y los tres
modelos: User, Room y Booking.

## 2. Dudas de uso de las herramientas
Propósito: Resolver dudas sobre la estructura de archivos en VS Code y el control de versiones inicial.

Prompts:
"Estoy en VS Code y la carpeta del proyecto está organizada con estructura full-stack (backend y frontend separados). Explícame en pasos cortos cómo inicializar el repositorio local, qué archivos esenciales no deben subirse al control de versiones, y cómo estructurar el .gitignore para evitar rastrear archivos temporales de cookies o dependencias de node."

Resultado Obtenido: Instrucciones directas sobre comandos de Git (git init, configuración de .gitignore excluyendo node_modules y archivos de pruebas como cookies.txt) y la organización de carpetas para los commits requeridos.

## 3. Backend y regla de solapamiento
Propósito: Implementar la lógica crítica de negocio para impedir reservas simultáneas en una misma sala.

Prompt: "Implementa en el backend con Express y Sequelize la validación de reservas solapadas por sala y fecha. Explícame la condición matemática utilizada. Indica qué casos límite debo probar (por ejemplo, una reserva que empieza exactamente cuando termina otra) y qué código de respuesta HTTP (409 Conflict) debe retornar cada caso."

Resultado Obtenido: "La ruta POST /api/bookings implementando la condición lógica de solapamiento (inicio_existente < fin_nuevo AND fin_existente > inicio_nuevo) y el manejo correcto del código de estado HTTP 409 cuando se detecta un conflicto."

## 4. Instrucciones de entrega
Propósito: Configurar la persistencia de sesión por cookies y la expiración por inactividad.

Prompts:
"Configura express-session para que la cookie de sesión expire a los 30 minutos de inactividad utilizando la opción rolling: true y una cookie de tipo httpOnly. Explícame cómo verificar mediante las herramientas de desarrollo del navegador o mediante comandos de prueba que el tiempo de expiración (Expires) se renueva con cada petición."

Resultado obtenido: El código de inicialización del middleware de sesión en Express con los parámetros de seguridad adecuados y la pauta para verificar el comportamiento de la cookie.

## 5. Pruebas con curl y corrección de errores

Propósito: Generar comandos de prueba (curl) para validar flujos correctos, errores de autenticación (401) y entradas de datos inválidas.

Prompts:
"Dame los comandos curl para probar el flujo completo: login, listado de salas, creación de una reserva válida, intento de reserva con solapamiento (esperando 409) y envío de una fecha inválida (esperando 400). Incluye las opciones para manejar la cookie de sesión entre peticiones."

Resultado obtenido: El bloque de comandos curl con el manejo del archivo de cookies (-c y -b), lo cual permitió detectar el fallo donde una fecha inválida ("hola") pasaba como código 201 y su posterior corrección con expresiones regulares.

## 6. Documentación

Propósito: Construir los componentes de React y un interceptor global para manejar la caducidad de la sesión.

Prompts:

"Escribe un módulo cliente en JavaScript (ej. api.js) para manejar las peticiones HTTP con fetch hacia el backend. Configúralo de manera que si cualquier respuesta HTTP devuelve un código 401 Unauthorized (y no estamos en la ruta de login), se ejecute un callback global para limpiar el estado de autenticación en React y redirigir al usuario al formulario de acceso con el mensaje 'Tu sesión expiró'."

Resultado obtenido: Una función centralizada de peticiones que evalúa el estatus de la respuesta y actualiza el estado de la aplicación en App.jsx para mostrar la pantalla de login cuando la sesión expira.