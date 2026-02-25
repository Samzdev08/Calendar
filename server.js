const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Connexion à MariaDB
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Super',
    database: 'calendar'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('✅ Connecté à la base de données MariaDB');
});

app.use(express.json());

// Middleware CORS
app.use(cors({
    origin: 'http://127.0.0.1:5501',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
    preflightContinue: false
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // ou mettre une URL précise à la place de '*'
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
    // Permet de répondre directement aux requêtes OPTIONS (pré-vol)
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
  
    next();
  });

// Transporteur Nodemailer (⚠️ remplace par ton vrai compte Gmail ou autre)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sammonkeyd0@gmail.com', // Ton adresse email
        pass: 'nxcv hnsu armu fvwd '   // Ton mot de passe d'application
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Erreur de configuration du transporteur:', error);
    } else {
        console.log('Transporteur Nodemailer prêt');
    }
});


// Fonction pour envoyer un mail
function envoyerEmail(destinataire, sujet, texte) {
    const mailOptions = {
        from: '"Calendrier App" <sammonkeyd0@gmail.com>',
        to: destinataire,
        subject: sujet,
        text: texte
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error("❌ Erreur lors de l'envoi de l'email :", error);
        }
        console.log("📧 Email envoyé :", info.response);
    });
}

// Route de connexion / création de compte
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const sqlCheck = 'SELECT * FROM users WHERE email = ?';
    connection.query(sqlCheck, [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur SQL" });

        if (results.length > 0) {
            const user = results[0];
            if (user.password !== password) {
                return res.status(401).json({ error: "Mot de passe incorrect" });
            }

            res.json({ message: "Connexion réussie", userId: user.id });
        } else {
            const sqlInsert = 'INSERT INTO users (email, password) VALUES (?, ?)';
            connection.query(sqlInsert, [email, password], (err, result) => {
                if (err) return res.status(500).json({ error: "Erreur lors de la création du compte" });

                envoyerEmail(email, "Bienvenue sur Calendrier App", `Bonjour et bienvenue !\nVotre compte a été créé avec succès.`);
                res.json({ message: "Compte créé et connecté", userId: result.insertId });
            });
        }
    });
});

// Récupérer les événements d’un utilisateur
app.get('/events/:userId', (req, res) => {
    const sql = "SELECT id, title, start, end, allDay FROM events WHERE user_id = ?";
    connection.query(sql, [req.params.userId], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la récupération" });
        res.json(results);
    });
});

// Utilitaire pour formater une date ISO pour SQL
function formatDateForSQL(isoDate) {
    const date = new Date(isoDate);
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Ajouter un événement
app.post('/add-events', (req, res) => {
    const { title, start, end, allDay, userId } = req.body;

    if (!title || !start || !end || !userId) {
        return res.status(400).json({ error: "Données incomplètes" });
    }

    const formattedStart = formatDateForSQL(start);
    const formattedEnd = formatDateForSQL(end);

    const sql = 'INSERT INTO events (user_id, title, start, end, allDay) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [userId, title, formattedStart, formattedEnd, allDay], (err, result) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });

        // Envoi de l'email
        connection.query('SELECT email FROM users WHERE id = ?', [userId], (err, resultEmail) => {
            if (!err && resultEmail.length > 0) {
                const email = resultEmail[0].email;
                envoyerEmail(email, "Nouvel événement ajouté", `Titre : ${title}\nDate : ${start}`);
            }
        });

        res.json({ id: result.insertId, message: "Événement ajouté" });
    });
});

// Modifier un événement
app.put('/update-event/:userId/:eventId', (req, res) => {
    const { userId, eventId } = req.params;
    const { title, start, end, allDay } = req.body;

    const sql = 'UPDATE events SET title = ?, start = ?, end = ?, allDay = ? WHERE id = ? AND user_id = ?';
    connection.query(sql, [title, start, end, allDay, eventId, userId], (err, result) => {
        if (err) return res.status(500).json({ error: "Erreur SQL" });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Événement non trouvé" });
        }

        connection.query('SELECT email FROM users WHERE id = ?', [userId], (err, resultEmail) => {
            if (!err && resultEmail.length > 0) {
                const email = resultEmail[0].email;
                envoyerEmail(email, "Événement modifié", `Nouveau titre : ${title}\nNouvelle date : ${start}`);
            }
        });

        res.json({ success: true, message: "Événement mis à jour" });
    });
});

// Supprimer un événement
app.delete('/delete-event/:userId/:eventId', (req, res) => {
    const { userId, eventId } = req.params;

    // Récupère le titre de l'événement avant suppression
    const sqlSelect = 'SELECT title FROM events WHERE id = ? AND user_id = ?';
    connection.query(sqlSelect, [eventId, userId], (err, selectResult) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la récupération de l'événement" });

        if (selectResult.length === 0) {
            return res.status(404).json({ error: "Événement non trouvé" });
        }

        const title = selectResult[0].title;

        const sqlDelete = 'DELETE FROM events WHERE id = ? AND user_id = ?';
        connection.query(sqlDelete, [eventId, userId], (err, deleteResult) => {
            if (err) return res.status(500).json({ error: "Erreur lors de la suppression" });

            if (deleteResult.affectedRows === 0) {
                return res.status(404).json({ error: "Événement non trouvé" });
            }

            // Envoie l'email avec le titre
            connection.query('SELECT email FROM users WHERE id = ?', [userId], (err, resultEmail) => {
                if (!err && resultEmail.length > 0) {
                    const email = resultEmail[0].email;
                    envoyerEmail(email, "Événement supprimé", `L'événement "${title}" a été supprimé.`);
                }
            });

            res.json({ success: true, message: "Événement supprimé" });
        });
    });
});


// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
