# entrypoint.sh - Se ejecuta antes de iniciar la app

# Ejecutar migraciones de Prisma
npx prisma migrate deploy

# Iniciar la aplicación
node server.js
