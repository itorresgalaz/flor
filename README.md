# Azucena blanca

Animacion web de una azucena blanca dibujada con Canvas 2D. Haz clic o toca la flor para verla abrirse; despues se mantiene un movimiento suave de brisa.

## Uso local

Desde esta carpeta, inicia un servidor estatico:

```bash
python -m http.server 8000
```

Abre <http://localhost:8000/> en el navegador. No hay dependencias ni paso de compilacion.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube `index.html`, `style.css`, `script.js` y `README.md`.
2. En el repositorio, abre **Settings > Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Selecciona la rama que contiene los archivos y la carpeta `/ (root)`.
5. Guarda la configuracion y espera a que GitHub Pages genere el enlace publico.

La pagina es estatica y no necesita servidor de aplicacion, variables de entorno ni servicios externos.
# flor
