const API = 'http://localhost:3000/api';

let onUnauthorized = () => {};

// App.jsx registra aqui que hacer cuando el servidor responde 401
export function setOnUnauthorized(fn) {
  onUnauthorized = fn;
}

export async function request(path, options = {}) {
  const res = await fetch(API + path, {
    credentials: 'include', // envia y recibe la cookie de sesion
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  // Sesion vencida o inexistente: volver al login
  // (el 401 del propio login es "credenciales invalidas", no sesion vencida)
  if (res.status === 401 && path !== '/login') {
    onUnauthorized();
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Error en la peticion');
    err.status = res.status;
    throw err;
  }
  return data;
}