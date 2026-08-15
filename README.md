# Cerrojo 🔐 — Gestor de contraseñas

Gestor de contraseñas **Zero-Knowledge** con cifrado 100% local, sincronización opcional en la nube y formato **PWA instalable** (móvil y escritorio).

## ✨ Características

- **Cifrado real**: AES-256-GCM para los datos y Argon2id para derivar la clave maestra.
- **Zero-Knowledge**: la nube solo almacena bloques cifrados; sin tu clave maestra nadie puede leerlos.
- **Recuperación de emergencia**: pregunta secreta para restablecer la clave maestra.
- **Autodestrucción segura**: tras 10 intentos fallidos, la bóveda local se elimina.
- **2FA (TOTP)**: códigos de verificación en dos pasos con anillo de 30 segundos.
- **Autobloqueo** por inactividad y **pantalla de privacidad** al cambiar de ventana.
- **Auditoría de seguridad**: contraseñas débiles, reutilizadas, antiguas y sitios sin 2FA.
- **Sincronización opcional** con tu propio proyecto de Supabase (multiusuario, RLS).
- **Respaldo cifrado** exportable/importable y **purga total** de datos.
- **Modo claro/oscuro**, diseño responsive y accesible, interfaz en español.

## 🚀 Usar la app

### Como PWA (recomendado)

1. Abre la URL del despliegue (GitHub Pages).
2. En Android: menú del navegador → **«Añadir a pantalla de inicio»**.
3. En escritorio: icono de instalación en la barra de direcciones.
4. La app funciona sin conexión una vez visitada.

### En desarrollo local
