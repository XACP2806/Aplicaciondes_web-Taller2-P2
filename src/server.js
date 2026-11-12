
import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middleware: convierte el cuerpo JSON en req.body
app.use(express.json());

// Middleware propio: registra cada petición
app.use((req, res, next) => {
  const hora = new Date().toISOString();
  console.log(`${hora} ${req.method} ${req.url}`);
  next();
});

// "Base de datos" en memoria (por ahora)
const fotos = [
  {
    id: 1,
    titulo: 'Atardecer',
    calificacion: 4.5,
    descripcion: 'Playa de Montañita'
  },
  {
    id: 2,
    titulo: 'Malecón',
    calificacion: 4.0,
    descripcion: 'Guayaquil de noche'
  }
];

// Contador independiente para no repetir IDs despues de eliminar fotos.
let siguienteId = Math.max(...fotos.map((foto) => foto.id)) + 1;

// Ruta GET para obtener todas las fotos
app.get('/api/fotos', (req, res) => {
  res.json(fotos);
});


app.get('/api/fotos/:id', (req, res) => {
  const id = Number(req.params.id);
  const foto = fotos.find((f) => f.id === id);

  if (!foto) {
    return res
      .status(404)
      .json({ mensaje: `Foto ${id} no encontrada` });
  }

  res.json(foto);
});


app.post('/api/fotos', (req, res) => {
  const { titulo, descripcion, calificacion } = req.body;

  if (!titulo) {
    return res
      .status(400)
      .json({ mensaje: 'El titulo es obligatorio' });
  }

  const nueva = {
    id: siguienteId++,
    titulo,
    descripcion,
    calificacion,
  };

  fotos.push(nueva);
  res.status(201).json(nueva);
});


app.patch('/api/fotos/:id', (req, res) => {
  const id = Number(req.params.id);
  const foto = fotos.find((f) => f.id === id);

  if (!foto) {
    return res.status(404).json({ mensaje: `Foto ${id} no encontrada` });
  }

  const cambios = req.body;
  if (!cambios || typeof cambios !== 'object' || Array.isArray(cambios)) {
    return res.status(400).json({ mensaje: 'Envia un objeto JSON' });
  }

  if (Object.hasOwn(cambios, 'titulo') && !cambios.titulo) {
    return res.status(400).json({ mensaje: 'El titulo es obligatorio' });
  }

  // Solo actualiza campos enviados; el ID no se puede modificar.
  for (const campo of ['titulo', 'descripcion', 'calificacion']) {
    if (Object.hasOwn(cambios, campo)) {
      foto[campo] = cambios[campo];
    }
  }

  res.json(foto);
});

app.delete('/api/fotos/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = fotos.findIndex((f) => f.id === id);

  if (indice === -1) {
    return res.status(404).json({ mensaje: `Foto ${id} no encontrada` });
  }

  fotos.splice(indice, 1);
  res.status(204).end();
});

 // Express 5: el error de una función async
 // llega solo al middleware de errores
app.get('/api/error', async () => {
  throw new Error('Algo salió mal');
});

// Middleware de errores: 4 parámetros
app.use((err, req, res, next) => {
  console.error(err.message);
  res
    .status(500)
    .json({ mensaje: 'Error interno del servidor' });
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
