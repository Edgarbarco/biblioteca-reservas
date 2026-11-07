# Decisiones

## a. Qué entendí del problema y qué tablas/modelos planeé

### Qué entendí

El problema pide una aplicación web para reservar salas de una biblioteca. Un
usuario debe iniciar sesión, ver el listado de salas y crear una reserva indicando
sala, fecha, hora de inicio y hora de fin. La regla principal es que una sala no
puede tener dos reservas con horarios solapados, y esa regla tiene que validarla el
backend, no solo el frontend, porque el frontend se puede saltar.

También entendí que la sesión debe manejarse con una cookie, que debe expirar a los
30 minutos de inactividad, y que cuando el servidor responde 401 (sesión inexistente
o vencida) el frontend debe llevar al usuario de nuevo al login.

### Stack elegido

- Backend: Node.js con Express y Sequelize, usando SQLite como base de datos porque
  no requiere instalar un servidor aparte.
- Sesión: express-session, que guarda un identificador en una cookie httpOnly y los
  datos de la sesión en el servidor.
- Frontend: React básico con Vite.

### Modelos y tablas

- User: id, username (único), passwordHash. La contraseña se guarda cifrada con
  bcrypt, nunca en texto plano.
- Room: id, name (único), capacity.
- Booking: id, roomId, userId, date, startTime, endTime.

Relaciones: una sala tiene muchas reservas y un usuario tiene muchas reservas. Cada
reserva pertenece a una sola sala y a un solo usuario.

Las horas se guardan como texto "HH:MM" porque, con ese formato de 24 horas,
comparar dos textos da el mismo resultado que comparar dos horas.

### Regla de solapamiento

Dos reservas de la misma sala y la misma fecha se solapan si:

inicio_existente < fin_nuevo  Y  fin_existente > inicio_nuevo

Con esta condición, una reserva de 10:00 a 11:00 y otra de 11:00 a 12:00 no se
consideran solapadas, porque la segunda empieza justo cuando termina la primera.
Si hay conflicto, el backend responde 409 y el frontend muestra el mensaje.

### Sesión de 30 minutos

La cookie se configura con maxAge de 30 minutos y rolling: true. Rolling renueva la
cookie en cada petición, así que la sesión expira por inactividad y no 30 minutos
después del login. Lo comprobé viendo que el valor Expires de la cookie se movía
hacia adelante con cada petición.

### Redirección ante 401

Todas las peticiones del frontend pasan por una función común (api.js). Si la
respuesta es 401 (excepto en el propio login, donde significa credenciales
inválidas), se ejecuta una función registrada por App.jsx que borra el usuario del
estado, y React vuelve a mostrar el login con el mensaje "Tu sesion expiro".

## b. Qué partes delegué a la IA y por qué

Delegué a la IA la escritura del código base: la configuración de Sequelize, los
modelos, el servidor Express con el login, las rutas de salas y reservas, y los
componentes de React (api.js, Login, Reservas y App). Lo hice porque eran partes
repetitivas y de sintaxis, y me permitieron avanzar más rápido hacia lo importante,
que era entender el flujo y probarlo.

Lo que no delegué fue la verificación. Yo ejecuté cada paso, probé el backend con
curl antes de hacer el commit, probé el frontend en el navegador y revisé qué
respondía el servidor en cada caso. También comprobé a mano el caso límite de la
regla de negocio (11:00 a 12:00 después de 10:00 a 11:00) y la expiración por 401,
reiniciando el servidor para que la sesión desapareciera.

Acepté la propuesta de la IA para el stack (SQLite, express-session, Vite) porque
cumplía el stack obligatorio y evitaba instalar un servidor de base de datos.

## c. Qué hizo mal la IA y cómo me di cuenta

1. Fecha sin validar. El código que generó la IA validaba el formato de las horas con
   una expresión regular, pero de la fecha solo comprobaba que no estuviera vacía
   (!date). Al probar con curl enviando "date":"hola", el servidor respondió 201 y
   guardó una reserva con la fecha "Invalid date" en la base de datos. Me di cuenta
   probando un caso inválido en lugar de solo casos correctos. Corrección: validar
   el formato YYYY-MM-DD con una expresión regular y comprobar que new Date(date)
   sea una fecha real. Después de corregir, "hola" responde 400, y borré la reserva
   basura de la base de datos con una sentencia DELETE.

2. Error al aplicar la corrección. Al reemplazar el bloque de validación se perdió la
   línea que definía timeFormat. La fecha inválida seguía dando 400 (por eso parecía
   que todo estaba bien), porque la condición se cortaba antes de usar timeFormat,
   pero una fecha válida daba 500 con "ReferenceError: timeFormat is not defined".
   Me di cuenta porque, después del arreglo, volví a probar también el caso normal.
   Lección: después de cada cambio hay que probar tanto el caso que falla como el
   que funcionaba.

3. cookies.txt casi se sube al repositorio. El archivo que curl creó con la cookie de
   sesión apareció en la lista de git status antes del primer commit. Lo vi al
   revisar el estado, lo quité del commit y lo agregué al .gitignore.

### Limitación que identifiqué y no corregí

La regla de solapamiento primero consulta si hay conflicto y después crea la reserva.
Si dos peticiones llegan al mismo tiempo para el mismo horario, las dos podrían pasar
la consulta antes de que alguna se guarde. Para resolverlo habría que usar una
transacción o un bloqueo en la base de datos. No lo probé ni lo implementé, pero
lo dejo anotado como mejora.