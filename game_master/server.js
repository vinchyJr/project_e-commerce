const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'game_master'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/signup', (req, res) => {
  const { username, email, password, specialCode } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const isAdmin = specialCode === 'wxcvbn';

  const checkUserSql = 'SELECT * FROM users WHERE username = ? OR email = ?';
  db.query(checkUserSql, [username, email], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (result.length > 0) {
      res.status(409).json({ success: false, error: 'Username or Email already exists.' });
      return;
    }

    const sql = 'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)';
    db.query(sql, [username, email, hashedPassword, isAdmin], (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ success: false, error: err.message });
        return;
      }
      res.status(200).json({ success: true });
    });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (result.length === 0) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const user = result[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    res.status(200).json({ success: true, isAdmin: user.is_admin });
  });
});

// Handle adding a new game
app.post('/addGame', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), (req, res) => {
  const { name, price } = req.body;
  const image = req.files['image'] ? req.files['image'][0].buffer : null;
  const video = req.files['video'] ? req.files['video'][0].buffer : null;

  if (!name || !price) {
    res.status(400).json({ success: false, error: 'Name and price are required' });
    return;
  }

  const sql = 'INSERT INTO games (name, price, image_blob, video_blob) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, price, image, video], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }
    res.status(200).json({ success: true });
  });
});

app.get('/games', (req, res) => {
  const sql = 'SELECT id, name, price FROM games';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ success: false, error: 'No games found' });
      return;
    }

    const games = result.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price
    }));

    res.status(200).json(games);
  });
});

app.get('/game/:id', (req, res) => {
  const gameId = req.params.id;
  const sql = 'SELECT name, price, image_blob, video_blob FROM games WHERE id = ?';
  db.query(sql, [gameId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ success: false, error: 'Game not found' });
      return;
    }

    const game = result[0];
    res.status(200).json({
      name: game.name,
      price: game.price,
      image: game.image_blob ? game.image_blob.toString('base64') : null,
      video: game.video_blob ? game.video_blob.toString('base64') : null
    });
  });
});

// Route to get user info
app.get('/user', (req, res) => {
  const userId = 1; // Replace with actual logic to get user ID
  const sql = 'SELECT id, username, email, balance FROM users WHERE id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.status(200).json(result[0]);
  });
});

// Route to get user orders
app.get('/orders', (req, res) => {
  const userId = 1; // Replace with actual logic to get user ID
  const sql = 'SELECT id, date, total FROM orders WHERE user_id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    res.status(200).json(result);
  });
});

// Other routes...

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
