import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const DB_PATH = './database-files/placement_log_db.sqlite';

let db;

// connecting to the database
(async () => {
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  console.log(`Connected to SQLite database at ${DB_PATH}`);
})();

// defining the routes
app.use(express.static('client'));
app.use(express.json());

app.get('/api/placement_logs', async (req, res) => {
  try {
    const logs = await db.all('SELECT * FROM placement_log');
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// POST api endpoint 
app.post('/api/placement_logs', async (req, res) => {
  const { date, description, skills } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO placement_log (date, description, skills) VALUES (?, ?, ?)',
      [date, description, skills]
    );
    res.status(200).json({ id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT api endpoint
app.put('/api/placement_logs/:id', async (req, res) => {
  const { date, description, skills } = req.body;
  const { id } = req.params;
  try {
    const statement = await db.prepare(
      'UPDATE placement_log SET date = ?, description = ?, skills = ? WHERE id = ?'
    );
    const result = await statement.run(date, description, skills, id);
    if (result.changes > 0) {
      res.status(200).json({ message: 'Log updated successfully.' });
    } else {
      res.status(404).json({ message: 'Log not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// DELETE api endpoint
app.delete('/api/deleteLog/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const statement = await db.prepare('DELETE FROM placement_log WHERE id = ?');
    const result = await statement.run(id);
    if (result.changes > 0) {
      res.status(200).json({ message: 'Log deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Log not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(8080, () => {
  console.log('Server started. Access the website at http://localhost:8080/');
});
