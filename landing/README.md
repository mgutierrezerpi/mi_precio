# MiPrecio Landing

Landing page inicial para `miprecio.app`. Es una aplicación estática servida en producción con Nginx dentro de Docker.

## Desarrollo local

```bash
npx serve .
```

## Validación

```bash
npm run check
docker compose build
```

## Despliegue en el servidor

Este stack está aislado de Plane y de cualquier servicio de automatización: usa su propio contenedor, red Docker y puerto configurable.

```bash
git clone https://github.com/mgutierrezerpi/mi_precio.git
cd mi_precio/landing
MIPRECIO_PORT=8088 docker compose up -d --build
```

El sitio queda disponible en el puerto configurado del host, por defecto `8088`. Para enrutar `miprecio.app`, el proxy del servidor debe apuntar a `127.0.0.1:8088`.

Comandos útiles:

```bash
docker compose ps
docker compose logs -f
docker compose restart miprecio-landing
docker compose down
```
