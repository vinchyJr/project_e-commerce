const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');

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

    res.status(200).json({ success: true, userId: user.id, isAdmin: user.is_admin });
  });
});

app.post('/addGame', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), (req, res) => {
  const { name, price, platform, quantity } = req.body;
  const image = req.files['image'] ? req.files['image'][0].buffer : null;
  const video = req.files['video'] ? req.files['video'][0].buffer : null;

  if (!name || !price || !platform || !quantity) {
    res.status(400).json({ success: false, error: 'Name, price, platform, and quantity are required' });
    return;
  }

  const sql = 'INSERT INTO games (name, price, platform, quantity, image_blob, video_blob) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, price, platform, quantity, image, video], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }
    res.status(200).json({ success: true });
  });
});

app.get('/games', (req, res) => {
  const { platform } = req.query;
  let sql;
  let params;

  if (platform === 'all') {
    sql = 'SELECT id, name, price, image_blob, video_blob FROM games';
    params = [];
  } else {
    sql = 'SELECT id, name, price, image_blob, video_blob FROM games WHERE platform = ? OR platform = "all"';
    params = [platform];
  }

  db.query(sql, params, (err, result) => {
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
      price: row.price,
      image: row.image_blob ? row.image_blob.toString('base64') : null,
      video: row.video_blob ? row.video_blob.toString('base64') : null
    }));

    res.status(200).json(games);
  });
});

app.get('/game/:id', (req, res) => {
  const gameId = req.params.id;
  const sql = 'SELECT name, price, platform, quantity, image_blob, video_blob FROM games WHERE id = ?';
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
      platform: game.platform,
      quantity: game.quantity,
      image: game.image_blob ? game.image_blob.toString('base64') : null,
      video: game.video_blob ? game.video_blob.toString('base64') : null
    });
  });
});

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
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

app.get('/orders/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = 'SELECT c.id, c.date_commande AS date, c.statut, SUM(cd.prix * cd.quantite) AS total FROM commandes c JOIN commande_details cd ON c.id = cd.commande_id WHERE c.utilisateur_id = ? GROUP BY c.id, c.date_commande, c.statut';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    res.status(200).json(result);
  });
});

app.post('/user/balance', (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount) {
    res.status(400).json({ success: false, error: 'User ID and amount are required' });
    return;
  }

  const sql = 'UPDATE users SET balance = balance + ? WHERE id = ?';
  db.query(sql, [amount, userId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    res.status(200).json({ success: true });
  });
});

app.post('/purchase', (req, res) => {
  const { userId } = req.body;

  const checkBalanceSql = 'SELECT balance, email FROM users WHERE id = ?';
  db.query(checkBalanceSql, [userId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const userBalance = result[0].balance;
    const userEmail = result[0].email;

    const getCartSql = 'SELECT g.id, g.name, g.price, cd.quantite FROM commande_details cd JOIN games g ON cd.jeu_id = g.id JOIN commandes c ON cd.commande_id = c.id WHERE c.utilisateur_id = ? AND c.statut = "en_attente"';
    db.query(getCartSql, [userId], (err, cart) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ success: false, error: err.message });
        return;
      }

      if (cart.length === 0) {
        res.status(400).json({ success: false, error: 'No items in the cart' });
        return;
      }

      const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantite), 0);

      if (userBalance < totalCost) {
        res.status(400).json({ success: false, error: 'Insufficient balance' });
        return;
      }

      const updateUserBalanceSql = 'UPDATE users SET balance = balance - ? WHERE id = ?';
      db.query(updateUserBalanceSql, [totalCost, userId], (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ success: false, error: err.message });
          return;
        }

        const updateCommandeStatusSql = 'UPDATE commandes SET statut = "expédiée" WHERE utilisateur_id = ? AND statut = "en_attente"';
        db.query(updateCommandeStatusSql, [userId], (err, result) => {
          if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ success: false, error: err.message });
            return;
          }

          const updateGameQuantities = cart.map(item => {
            return new Promise((resolve, reject) => {
              const updateQuantitySql = 'UPDATE games SET quantity = quantity - ? WHERE id = ?';
              db.query(updateQuantitySql, [item.quantite, item.id], (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              });
            });
          });

          Promise.all(updateGameQuantities)
            .then(() => {
              const generateActivationCode = () => Math.random().toString(36).substr(2, 9).toUpperCase();
              const activationCodes = cart.map(game => ({ game, code: generateActivationCode() }));

              const doc = new PDFDocument();
              const fileName = `invoice_${userId}_${Date.now()}.pdf`;
              const filePath = path.join(__dirname, 'invoices', fileName);

              doc.pipe(fs.createWriteStream(filePath));
              doc.fontSize(25).text('Invoice', { align: 'center' });
              doc.text(`User ID: ${userId}`, 50, 100);
              doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 120);
              doc.text('---------------------------------', 50, 150);

              let y = 180;
              activationCodes.forEach(({ game, code }) => {
                doc.text(`Game: ${game.name}`, 50, y);
                doc.text(`Price: €${game.price.toFixed(2)}`, 200, y);
                doc.text(`Activation Code: ${code}`, 350, y);
                y += 20;
              });

              doc.text('---------------------------------', 50, y);
              doc.text(`Total: €${totalCost.toFixed(2)}`, 50, y + 20);
              doc.end();

              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'game.master.ynov@gmail.com', 
                  pass: 'Passw0rd_'
                }
              });

              const mailOptions = {
                from: 'game.master.ynov@gmail.com', 
                to: userEmail, 
                subject: 'Your Game Purchase Invoice and Activation Codes',
                text: 'Thank you for your purchase! Attached is your invoice and activation codes for your games.',
                attachments: [
                  {
                    filename: fileName,
                    path: filePath
                  }
                ]
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error('Error sending email:', error);
                  res.status(500).json({ success: false, error: 'Failed to send email' });
                  return;
                }

                res.status(200).json({ success: true, message: 'Purchase completed and email sent', invoice: fileName });
              });
            })
            .catch(err => {
              console.error('Error updating game quantities:', err);
              res.status(500).json({ success: false, error: 'Failed to update game quantities' });
            });
        });
      });
    });
  });
});

app.post('/cart/add', (req, res) => {
  const { userId, gameId } = req.body;
  if (!userId || !gameId) {
    res.status(400).json({ success: false, error: 'User ID and game ID are required' });
    return;
  }

  const checkCartSql = 'SELECT * FROM commandes WHERE utilisateur_id = ? AND statut = "en_attente"';
  db.query(checkCartSql, [userId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    let commandeId;
    if (result.length === 0) {
      const createCommandeSql = 'INSERT INTO commandes (utilisateur_id) VALUES (?)';
      db.query(createCommandeSql, [userId], (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ success: false, error: err.message });
          return;
        }

        commandeId = result.insertId;
        const insertDetailSql = 'INSERT INTO commande_details (commande_id, jeu_id, quantite, prix) VALUES (?, ?, 1, (SELECT price FROM games WHERE id = ?))';
        db.query(insertDetailSql, [commandeId, gameId, gameId], (err, result) => {
          if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ success: false, error: err.message });
            return;
          }
          res.status(200).json({ success: true });
        });
      });
    } else {
      commandeId = result[0].id;
      const insertDetailSql = 'INSERT INTO commande_details (commande_id, jeu_id, quantite, prix) VALUES (?, ?, 1, (SELECT price FROM games WHERE id = ?))';
      db.query(insertDetailSql, [commandeId, gameId, gameId], (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ success: false, error: err.message });
          return;
        }
        res.status(200).json({ success: true });
      });
    }
  });
});

app.get('/cart/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = 'SELECT g.id, g.name, g.price, g.image_blob FROM commande_details cd JOIN games g ON cd.jeu_id = g.id JOIN commandes c ON cd.commande_id = c.id WHERE c.utilisateur_id = ? AND c.statut = "en_attente"';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    const cart = result.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      image: row.image_blob ? row.image_blob.toString('base64') : null
    }));

    res.status(200).json(cart);
  });
});

app.post('/cart/remove', (req, res) => {
  const { userId, gameId } = req.body;
  if (!userId || !gameId) {
    res.status(400).json({ success: false, error: 'User ID and game ID are required' });
    return;
  }

  const checkCartSql = 'SELECT * FROM commandes WHERE utilisateur_id = ? AND statut = "en_attente"';
  db.query(checkCartSql, [userId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (result.length === 0) {
      res.status(400).json({ success: false, error: 'No pending order found' });
      return;
    }

    const commandeId = result[0].id;
    const deleteDetailSql = 'DELETE FROM commande_details WHERE commande_id = ? AND jeu_id = ?';
    db.query(deleteDetailSql, [commandeId, gameId], (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ success: false, error: err.message });
        return;
      }

      res.status(200).json({ success: true });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
