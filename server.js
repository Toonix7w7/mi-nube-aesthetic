const express = require('express');
const multer = require('multer');
const Datastore = require('nedb-promises');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Permite al servidor leer datos de texto de los formularios
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 1. CONEXIÓN A BASE DE DATOS LOCAL PORTÁTIL (NEDB)
// ==========================================
// Crea un archivo físico llamado 'archivos.db' en tu proyecto. ¡No requiere instalar nada!
const db = Datastore.create({ filename: 'archivos.db', autoload: true });
console.log('🍃 Base de datos interna (.db) cargada con éxito en tu computadora');

// ==========================================
// 2. CONFIGURACIÓN DE ALMACENAMIENTO (MULTER)
// ==========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const nombreUsuario = req.body.nombrePersonalizado ? req.body.nombrePersonalizado.trim() : '';
        let nombreFinal = '';

        if (nombreUsuario !== '') {
            nombreFinal = nombreUsuario.replace(/[^a-zA-Z0-9-_ ]/g, '') + extension;
        } else {
            nombreFinal = Date.now() + '-' + file.originalname;
        }
        cb(null, nombreFinal);
    }
});

const upload = multer({ storage: storage });

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// ==========================================
// 3. MIDDLEWARES (RUTAS ESTÁTICAS)
// ==========================================
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

// ==========================================
// 4. RUTAS DE LA APLICACIÓN
// ==========================================

// Ruta para recibir archivos y GUARDARLOS en la base de datos interna
app.post('/subir', upload.single('archivo'), async (req, fileRes) => {
    if (!req.file) {
        return fileRes.status(400).send('No se seleccionó ningún archivo.');
    }

    try {
        // Creamos la estructura del registro
        const nuevoArchivo = {
            nombreOriginal: req.file.originalname,
            nombreVirtual: req.file.filename,
            url: `/uploads/${req.file.filename}`,
            categoria: req.body.categoria || 'General',
            fechaSubida: new Date()
        };

        // Guardamos directamente en el archivo .db local
        await db.insert(nuevoArchivo);
        console.log('📝 Archivo registrado localmente:', req.file.filename);
        
        fileRes.redirect('/');
    } catch (error) {
        console.error(error);
        fileRes.status(500).send('Error al guardar en la base de datos local.');
    }
});

// Ruta que consulta los archivos guardados
app.get('/archivos', async (req, res) => {
    try {
        // Buscamos todos los archivos y los ordenamos por fecha de subida de forma descendente
        const archivosDB = await db.find({}).sort({ fechaSubida: -1 });
        
        const listaArchivos = archivosDB.map(file => {
            return {
                nombre: file.nombreVirtual,
                url: file.url,
                categoria: file.categoria
            };
        });
        
        res.json(listaArchivos);
    } catch (error) {
        res.status(500).json({ error: 'No se pudieron consultar los archivos' });
    }
});

// ==========================================
// 5. ENCENDIDO DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Servidor corriendo sin bloqueos en http://localhost:${PORT}`);
    console.log(`==================================================`);
});