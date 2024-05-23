const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const mailjet = require('node-mailjet').apiConnect(
  '9150e6506fa1861bf29ce79bed6e4887',
  '067c014b80d48c141b4c573e66b4e079'
);

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
    console.error('Erreur de connexion à la base de données : ' + err.stack);
    return;
  }
  console.log('Connecté à la base de données.');
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/signup', (req, res) => {
  const { username, email, password, specialCode, birthdate } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const isAdmin = specialCode === 'wxcvbn';

  const checkUserSql = 'SELECT * FROM users WHERE username = ? OR email = ?';
  db.query(checkUserSql, [username, email], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (result.length > 0) {
      res.status(409).json({ success: false, error: 'Le nom d\'utilisateur ou l\'email existe déjà.' });
      return;
    }

    const sql = 'INSERT INTO users (username, email, password, birthdate, is_admin) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [username, email, hashedPassword, birthdate, isAdmin], (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'exécution de la requête :', err);
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
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (result.length === 0) {
      res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect.' });
      return;
    }

    const user = result[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect.' });
      return;
    }

    res.status(200).json({ success: true, userId: user.id, isAdmin: user.is_admin });
  });
});

app.get('/admin/users', (req, res) => {
  const sql = 'SELECT id, username, email, is_admin FROM users';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }
    res.status(200).json(result);
  });
});

app.post('/admin/users/ban', (req, res) => {
  const { userId } = req.body;
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }
    res.status(200).json({ success: true });
  });
});

app.get('/admin/stats', (req, res) => {
  const queries = {
    totalMembers: 'SELECT COUNT(*) AS count FROM users',
    totalSales: 'SELECT COUNT(*) AS count FROM commandes WHERE statut = "expédiée"',
    newSales: `SELECT COUNT(*) AS count FROM commandes WHERE statut = "expédiée" AND date_commande >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    totalRevenue: 'SELECT COALESCE(SUM(cd.prix * cd.quantite), 0) AS revenue FROM commande_details cd JOIN commandes c ON cd.commande_id = c.id WHERE c.statut = "expédiée"',
    revenueLast7Days: `SELECT COALESCE(SUM(cd.prix * cd.quantite), 0) AS revenue FROM commande_details cd JOIN commandes c ON cd.commande_id = c.id WHERE c.statut = "expédiée" AND c.date_commande >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
  };

  const stats = {};

  db.query(queries.totalMembers, (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    stats.totalMembers = result[0].count || 0;

    db.query(queries.totalSales, (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      stats.totalSales = result[0].count || 0;

      db.query(queries.newSales, (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        stats.newSales = result[0].count || 0;

        db.query(queries.totalRevenue, (err, result) => {
          if (err) return res.status(500).json({ success: false, error: err.message });
          stats.totalRevenue = result[0].revenue || 0;

          db.query(queries.revenueLast7Days, (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            stats.revenueLast7Days = result[0].revenue || 0;

            res.status(200).json({ success: true, stats });
          });
        });
      });
    });
  });
});

app.post('/addGame', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), (req, res) => {
  const { name, price, platform, quantity } = req.body;
  const image = req.files['image'] ? req.files['image'][0].buffer : null;
  const video = req.files['video'] ? req.files['video'][0].buffer : null;

  if (!name || !price || !platform || !quantity) {
    res.status(400).json({ success: false, error: 'Le nom, le prix, la plateforme et la quantité sont requis.' });
    return;
  }

  const sql = 'INSERT INTO games (name, price, platform, quantity, image_blob, video_blob) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, price, platform, quantity, image, video], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
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
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ success: false, error: 'Aucun jeu trouvé' });
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
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ success: false, error: 'Jeu non trouvé' });
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

app.put('/game/:id', (req, res) => {
  const gameId = req.params.id;
  const { name, price, quantity } = req.body;

  const sql = 'UPDATE games SET name = ?, price = ?, quantity = ? WHERE id = ?';
  db.query(sql, [name, price, quantity, gameId], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    res.status(200).json({ success: true });
  });
});

app.delete('/game/:id', (req, res) => {
  const gameId = req.params.id;

  const sql = 'DELETE FROM games WHERE id = ?';
  db.query(sql, [gameId], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }
    res.status(200).json({ success: true });
  });
});

app.get('/reviews/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  const sql = 'SELECT r.id, r.user_id, r.game_id, r.rating, r.comment, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.game_id = ?';
  db.query(sql, [gameId], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }
    res.status(200).json(result);
  });
});

app.post('/reviews', (req, res) => {
  const { userId, gameId, rating, comment } = req.body;

  console.log('Avis reçu :', req.body);

  if (!userId || !gameId || !rating || !comment) {
    return res.status(400).json({ success: false, error: 'Tous les champs sont obligatoires' });
  }

  const sql = 'INSERT INTO reviews (user_id, game_id, rating, comment) VALUES (?, ?, ?, ?)';
  db.query(sql, [userId, gameId, rating, comment], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      return res.status(500).json({ success: false, error: 'Échec de la soumission de l\'avis' });
    }   
    res.status(200).json({ success: true, message: 'Avis soumis avec succès' });
  });
});

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT id, username, email, balance, is_admin FROM users WHERE id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      return;
    }

    res.status(200).json(result[0]);
  });
});

app.put('/user/:id', (req, res) => {
  const userId = req.params.id;
  const { username, email, birthdate } = req.body;

  const sql = 'UPDATE users SET username = ?, email = ?, birthdate = ? WHERE id = ?';
  db.query(sql, [username, email, birthdate, userId], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    res.status(200).json({ success: true });
  });
});


app.get('/orders/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = 'SELECT c.id, c.date_commande AS date, c.statut, SUM(cd.prix * cd.quantite) AS total FROM commandes c JOIN commande_details cd ON c.id = cd.commande_id WHERE c.utilisateur_id = ? GROUP BY c.id, c.date_commande, c.statut';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    res.status(200).json(result);
  });
});

app.post('/user/balance', (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount) {
    res.status(400).json({ success: false, error: 'User ID et montant sont obligatoires' });
    return;
  }

  const sql = 'UPDATE users SET balance = balance + ? WHERE id = ?';
  db.query(sql, [amount, userId], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
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
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      return;
    }

    const userBalance = result[0].balance;
    const userEmail = result[0].email;

    const getCartSql = 'SELECT g.id, g.name, g.price, cd.quantite FROM commande_details cd JOIN games g ON cd.jeu_id = g.id JOIN commandes c ON cd.commande_id = c.id WHERE c.utilisateur_id = ? AND c.statut = "en_attente"';
    db.query(getCartSql, [userId], (err, cart) => {
      if (err) {
        console.error('Erreur lors de l\'exécution de la requête :', err);
        res.status(500).json({ success: false, error: err.message });
        return;
      }

      if (cart.length === 0) {
        res.status(400).json({ success: false, error: 'Aucun article dans le panier' });
        return;
      }

      const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantite), 0);

      if (userBalance < totalCost) {
        res.status(400).json({ success: false, error: 'Solde insuffisant' });
        return;
      }

      const updateUserBalanceSql = 'UPDATE users SET balance = balance - ? WHERE id = ?';
      db.query(updateUserBalanceSql, [totalCost, userId], (err, result) => {
        if (err) {
          console.error('Erreur lors de l\'exécution de la requête :', err);
          res.status(500).json({ success: false, error: err.message });
          return;
        }

        const updateCommandeStatusSql = 'UPDATE commandes SET statut = "expédiée" WHERE utilisateur_id = ? AND statut = "en_attente"';
        db.query(updateCommandeStatusSql, [userId], (err, result) => {
          if (err) {
            console.error('Erreur lors de l\'exécution de la requête :', err);
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

              const invoicesDir = path.join(__dirname, 'factures');
              if (!fs.existsSync(invoicesDir)) {
                fs.mkdirSync(invoicesDir);
              }

              const getOrderNumberSql = 'SELECT COUNT(*) AS orderCount FROM commandes WHERE utilisateur_id = ? AND statut IN ("expédiée", "livrée")';
              db.query(getOrderNumberSql, [userId], (err, orderResult) => {
                if (err) {
                  console.error('Erreur lors de l\'exécution de la requête :', err);
                  res.status(500).json({ success: false, error: err.message });
                  return;
                }

                const orderNumber = orderResult[0].orderCount + 1;
                const fileName = `facture_${userId}_${orderNumber}.pdf`;
                const filePath = path.join(invoicesDir, fileName);

                const doc = new PDFDocument();
                const writeStream = fs.createWriteStream(filePath);
                doc.pipe(writeStream);
                doc.fontSize(25).text('Facture', { align: 'center' });
                doc.text(`User ID: ${userId}`, 50, 100);
                doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 120);
                doc.text('---------------------------------', 50, 150);

                let y = 180;
                activationCodes.forEach(({ game, code }) => {
                  doc.text(`Jeu: ${game.name}`, 50, y);
                  doc.text(`Prix: €${game.price.toFixed(2)}`, 200, y);
                  doc.text(`Code d'activation: ${code}`, 350, y);
                  y += 20;
                });

                doc.text('---------------------------------', 50, y);
                doc.text(`Total: €${totalCost.toFixed(2)}`, 50, y + 20);
                doc.end();

                writeStream.on('finish', () => {
                  const emailData = {
                    Messages: [
                      {
                        From: {
                          Email: 'game.master.ynov@gmail.com',
                          Name: 'Game Master'
                        },
                        To: [
                          {
                            Email: userEmail,
                            Name: 'Utilisateur'
                          }
                        ],
                        Subject: 'Votre facture d\'achat de jeux et codes d\'activation',
                        TextPart: 'Merci pour votre achat ! Vous trouverez ci-joint votre facture et les codes d\'activation pour vos jeux.',
                        Attachments: [
                          {
                            ContentType: 'application/pdf',
                            Filename: fileName,
                            Base64Content: fs.readFileSync(filePath).toString('base64')
                          }
                        ]
                      }
                    ]
                  };

                  mailjet
                    .post('send', { version: 'v3.1' })
                    .request(emailData)
                    .then((result) => {
                      console.log(result.body);
                      res.status(200).json({ success: true, message: 'Achat complété et email envoyé', invoice: fileName });
                    })
                    .catch((err) => {
                      console.error('Erreur lors de l\'envoi de l\'email :', err);
                      res.status(500).json({ success: false, error: 'Échec de l\'envoi de l\'email' });
                    });
                });
              });
            })
            .catch(err => {
              console.error('Erreur lors de la mise à jour des quantités de jeux :', err);
              res.status(500).json({ success: false, error: 'Échec de la mise à jour des quantités de jeux' });
            });
        });
      });
    });
  });
});

app.post('/cart/add', (req, res) => {
  const { userId, gameId } = req.body;
  if (!userId || !gameId) {
    res.status(400).json({ success: false, error: 'User ID et Game ID sont obligatoires' });
    return;
  }

  const checkCartSql = 'SELECT * FROM commandes WHERE utilisateur_id = ? AND statut = "en_attente"';
  db.query(checkCartSql, [userId], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    let commandeId;
    if (result.length === 0) {
      const createCommandeSql = 'INSERT INTO commandes (utilisateur_id) VALUES (?)';
      db.query(createCommandeSql, [userId], (err, result) => {
        if (err) {
          console.error('Erreur lors de l\'exécution de la requête :', err);
          res.status(500).json({ success: false, error: err.message });
          return;
        }

        commandeId = result.insertId;
        const insertDetailSql = 'INSERT INTO commande_details (commande_id, jeu_id, quantite, prix) VALUES (?, ?, 1, (SELECT price FROM games WHERE id = ?))';
        db.query(insertDetailSql, [commandeId, gameId, gameId], (err, result) => {
          if (err) {
            console.error('Erreur lors de l\'exécution de la requête :', err);
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
          console.error('Erreur lors de l\'exécution de la requête :', err);
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
      console.error('Erreur lors de l\'exécution de la requête :', err);
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
    res.status(400).json({ success: false, error: 'User ID et Game ID sont obligatoires' });
    return;
  }

  const checkCartSql = 'SELECT * FROM commandes WHERE utilisateur_id = ? AND statut = "en_attente"';
  db.query(checkCartSql, [userId], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (result.length === 0) {
      res.status(400).json({ success: false, error: 'Aucune commande en attente trouvée' });
      return;
    }

    const commandeId = result[0].id;
    const deleteDetailSql = 'DELETE FROM commande_details WHERE commande_id = ? AND jeu_id = ?';
    db.query(deleteDetailSql, [commandeId, gameId], (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'exécution de la requête :', err);
        res.status(500).json({ success: false, error: err.message });
        return;
      }

      res.status(200).json({ success: true });
    });
  });
});


app.put('/admin/featured-game', (req, res) => {
  const { gameId } = req.body;

  if (!gameId) {
    return res.status(400).json({ success: false, error: 'Game ID is required' });
  }

  const sql = 'UPDATE settings SET featured_game_id = ? WHERE id = 1';
  db.query(sql, [gameId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du jeu en avant :', err);
      return res.status(500).json({ success: false, error: 'Échec de la mise à jour du jeu en avant' });
    }
    return res.status(200).json({ success: true });
  });
});



app.get('/featured-game', (req, res) => {
  const sql = 'SELECT featured_game_id FROM settings WHERE id = 1';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération du jeu en avant :', err);
      return res.status(500).json({ success: false, error: 'Échec de la récupération du jeu en avant' });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Jeu en avant non trouvé' });
    }

    res.status(200).json({ id: result[0].featured_game_id });
  });
});



app.get('/invoices/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'factures', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ success: false, error: 'Facture non trouvée' });
  }
});

app.listen(port, () => {
  console.log(`Le serveur fonctionne sur le port ${port}`);
});
