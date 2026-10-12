// server/server.js
const express = require('express')
const cors = require('cors')
const db = require('./database')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// --- ROUTES STOCKS ---
app.get('/api/stocks', (req, res) => {
  db.all(`SELECT * FROM stocks`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.post('/api/stocks', (req, res) => {
  const { article, categorie, stock, seuil } = req.body
  db.run(`INSERT INTO stocks (article, categorie, stock, seuil) VALUES (?, ?, ?, ?)`,
    [article, categorie, stock, seuil],
    function(err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ id: this.lastID, message: 'Stock ajouté avec succès' })
    }
  )
})

// --- ROUTES SAISIE / OPÉRATIONS ---
app.get('/api/saisie', (req, res) => {
  db.all(`SELECT * FROM operations ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.post('/api/saisie', (req, res) => {
  const { categorie, site, date, details, valeur } = req.body
  db.run(`INSERT INTO operations (categorie, site, date, details, valeur) VALUES (?, ?, ?, ?, ?)`,
    [categorie, site, date, details, valeur],
    function(err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ id: this.lastID, message: 'Opération enregistrée' })
    }
  )
})

// --- ROUTE DE SYNCHRONISATION HORS-LIGNE ---
app.post('/api/sync', (req, res) => {
  const { operations } = req.body
  if (!operations || !Array.isArray(operations)) {
    return res.status(400).json({ error: 'Format invalide' })
  }

  const stmt = db.prepare(`INSERT INTO operations (categorie, site, date, details, valeur) VALUES (?, ?, ?, ?, ?)`)
  db.serialize(() => {
    operations.forEach(op => {
      stmt.run(op.categorie, op.site, op.date, op.details, op.valeur)
    })
    stmt.finalize()
  })

  res.json({ success: true, synchronizedCount: operations.length })
})

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur Backend API en cours d'exécution sur le port ${PORT}`)
})
// --- GESTION DES UTILISATEURS & AUTHENTIFICATION ---

// Initialisation de la table utilisateurs dans database.js ou server.js
db.run(`CREATE TABLE IF NOT EXISTS utilisateurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'Agent'
)`)

// Route de Connexion (Login)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body
  db.get(`SELECT * FROM utilisateurs WHERE email = ? AND password = ?`, [email, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message })
    if (!row) return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    
    res.json({ 
      success: true, 
      message: 'Connexion réussie', 
      user: { id: row.id, nom: row.nom, email: row.email, role: row.role } 
    })
  })
})

// Route d'Inscription (Register)
app.post('/api/register', (req, res) => {
  const { nom, email, password, role } = req.body
  db.run(`INSERT INTO utilisateurs (nom, email, password, role) VALUES (?, ?, ?, ?)`,
    [nom, email, password, role || 'Agent'],
    function(err) {
      if (err) return res.status(400).json({ error: 'Cet email est déjà utilisé.' })
      res.json({ success: true, id: this.lastID, message: 'Compte créé avec succès' })
    }
  )
})