require('dotenv').config();
const express = require('express');
const auth = express.Router()
const bcrypt = require('bcryptjs');
const pgp = require('pg-promise')();
const db = pgp({
  connectionString: process.env.DATABASE_URL// ,
  // ssl: { rejectUnauthorized: false }
});
const saltRounds = 10;
exports.auth = auth;
exports.db = db;

// AUTH FUNCTIONS
// Authentication Router
// Handles HTTP requests that go to https://localhost:PORT/auth

// Login User function
// Return Values:
//    null: if matching user does not exist
//    object: returns the correct user
async function loginUser(username, password) {
  return bcrypt.hash('1', saltRounds).then(async (fakeHash) => {
    return db.one(`SELECT Username, Password FROM users WHERE Username='${username}'`).then(async (user) => {
      return bcrypt.compare(password, user.password).then(async (loggedIn) => {
        if (loggedIn) { return user } else { return null }
      })
    }).catch(async error => {
      console.log(error.message || error)
      return await bcrypt.compare('2', fakeHash).then(async () => { return null })
    })
  })
}

// Login page methods
auth.get('/login', (req, res) => res.render('pages/auth/login', { title: 'Login', message: null })
)
auth.post('/login', async (req, res) => {
  await loginUser(req.body.username, req.body.password).then(async (user) => {
    if (user) {
      res.render('pages/auth/login', { title: 'Login', message: `Successfully logged in as ${user.username}` })
    } else {
      res.render('pages/auth/login', { title: 'Login', message: "The username and password provided do not match our records." })
    }
  })
})

// Register User function
// Return Values: 
//    Bool: True if user successfully registered, false if not!
async function registerUser(username, password) {
  return db.none(`SELECT * FROM users WHERE Username='${username}'`).then(async () => {
    return bcrypt.hash(password, saltRounds).then(async (hashedPass) => {
      return db.query(`INSERT INTO users VALUES ('${username}', '${hashedPass}')`).then(async () => { return true })
    })
  }).catch(error => {
    console.log(error.message || error)
    return false
  })
}

// Register page methods
auth.get('/register', (req, res) => res.render('pages/auth/register', { title: 'Register', message: null }))
auth.post('/register', async (req, res) => {
  if (await registerUser(req.body.username, req.body.password)) {
    res.render('pages/auth/register', { title: 'Register', message: `User "${req.body.username}" has been created.`})
  } else {
    res.render('pages/auth/register', { title: 'Register', message: `User "${req.body.username}" already exists.`})
  }
});