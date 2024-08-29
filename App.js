const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Crear la conexión a la base de datos SQLite
let db = new sqlite3.Database('students.sqlite', (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

// Ruta para manejar GET y POST en "/students"
app.route('/students')
  .get((req, res) => {
    db.all("SELECT * FROM students", [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  })
  .post((req, res) => {
    const { firstname, lastname, gender, age } = req.body;
    const sql = `INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)`;
    const params = [firstname, lastname, gender, age];

    db.run(sql, params, function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        firstname,
        lastname,
        gender,
        age
      });
    });
  });

// Ruta para manejar GET, PUT, y DELETE en "/student/:id"
app.route('/student/:id')
  .get((req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM students WHERE id = ?";
    db.get(sql, [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (row) {
        res.json(row);
      } else {
        res.status(404).json({ message: "Student not found" });
      }
    });
  })
  .put((req, res) => {
    const { firstname, lastname, gender, age } = req.body;
    const id = req.params.id;
    const sql = `UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?`;
    const params = [firstname, lastname, gender, age, id];

    db.run(sql, params, function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        id,
        firstname,
        lastname,
        gender,
        age
      });
    });
  })
  .delete((req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM students WHERE id = ?";
    
    db.run(sql, id, function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ message: `Student with id ${id} deleted` });
    });
  });

// Iniciar el servidor
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
