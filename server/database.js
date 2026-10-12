// server/database.js
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Connexion à la base de données SQLite (fichier local 'mayas_volaille.db')
const dbPath = path.resolve(__dirname, 'mayas_volaille.db')
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données SQL :', err.message)
  } else {
    console.log('Connecté à la base de données SQLite de Mayas Volaille.')
  }
})

// Création des tables
db.serialize(() => {
  // Table des opérations de saisie universelle
  db.run(`CREATE TABLE IF NOT EXISTS operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categorie TEXT,
    site TEXT,
    date TEXT,
    details TEXT,
    valeur TEXT,
    statut TEXT DEFAULT 'Enregistré'
  )`)

  // Table des stocks
  db.run(`CREATE TABLE IF NOT EXISTS stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article TEXT,
    categorie TEXT,
    stock INTEGER,
    seuil INTEGER
  )`)

  // Table des factures et finances
  db.run(`CREATE TABLE IF NOT EXISTS factures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT,
    client TEXT,
    montant_total REAL,
    reste_a_payer REAL,
    statut TEXT
  )`)
})

module.exports = db