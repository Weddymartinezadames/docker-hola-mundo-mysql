const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Configuración de la conexión usando las variables del docker-compose
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'holamundo_db'
};

// Función para intentar conectar con reintentos si MySQL tarda en arrancar
function connectWithRetry() {
  const connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log('Esperando a que la base de datos MySQL esté lista...');
      setTimeout(connectWithRetry, 3000);
    } else {
      console.log('¡Conexión exitosa a MySQL!');

      // Ruta principal
      app.get('/', (req, res) => {
        connection.query('SELECT "Hola Mundo desde MySQL!" AS mensaje', (queryErr, results) => {
          if (queryErr) {
            res.status(500).send('Error en la consulta a la BD');
          } else {
            res.send(`<h1>${results[0].mensaje}</h1><p>Conexión a MySQL realizada con éxito.</p>`);
          }
        });
      });

      app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
      });
    }
  });
}

connectWithRetry();