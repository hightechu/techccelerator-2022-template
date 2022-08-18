const express = require('express');
const app = express()
const auth = express.Router()
const bcrypt = require('bcrypt');
const { connect } = require('http2');
const path = require('path');
const { errors, queryResult } = require('pg-promise');
const { isNull } = require('util');
const e = require('express');
const pgp = require('pg-promise')();
const db = pgp({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const PORT = process.env.PORT || 5000
const saltRounds = 10;

// DATABASE CONFIG
db.query("CREATE TABLE IF NOT EXISTS users ( \
  Username varchar(50) NOT NULL UNIQUE, \
  Password varchar(60) NOT NULL);"
);
// DEVELOPERS SHOULD ADD CODE HERE



// DEVELOPERS CODE ENDS HERE
app.use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  // ROUTING EXAMPLES
  .get('/', (req, res) => res.render('pages/index', { title: 'Home' }))
  .get('/help', (req, res) => res.render('pages/help', { title: 'Help' }))
  // ROUTING STARTS HERE



  // ROUTING ENDS HERE
  .use('/auth', auth)
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

// AUTH FUNCTIONS
// Authentication Router
// Handles HTTP requests that go to https://webapp/auth

// Login User function
// Return Values:
//    null: if matching user does not exist
//    object: returns the correct user
async function loginUser(username, password) {
  const fakeHash = await bcrypt.hash('1', saltRounds)

  const user = await db.one(`SELECT * FROM users WHERE Username='${username}'`).catch(async error => {
    console.log(error.message || error)
    return await bcrypt.compare('2', fakeHash).then(() => { return null })
  })

  const loggedIn = await bcrypt.compare(password, user.Password)
  if (loggedIn) {
    return user
  } else { return null }
}

// Login page methods
auth.get('/login', (req, res) => res.render('pages/auth/login', { title: 'Login' }))
auth.post('/login', async (req, res) => {
  const user = await loginUser(req.body.username, req.body.password)
  if (user) {
    res.send(`Successfully logged in as ${user}`)
  } else {
    res.send("The username and password provided do not match our records.")
  }
})

// Register User function
// Return Values: 
//   Bool
// Possible Error Values:
//    QueryResultError: This happens if the username is already taken
async function registerUser(username, password) {
  await db.none(`SELECT * FROM users WHERE Username='${username}'`).catch(error => {
    console.log(error.message || error)
    return false
  })
  const hashedPass = await bcrypt.hash(password, saltRounds)
  return await db.query(`INSERT INTO users VALUES ('${username}', '${hashedPass}')`).then(() => { return true })
}

// Register page methods
auth.get('/register', (req, res) => res.render('pages/auth/register', { title: 'Register' }))
auth.post('/register', async (req, res) => {
  const registerdUser = await registerUser(req.body.username, req.body.password)
  if (registerdUser) {
    res.send(`User "${req.body.username}" has been created.`)
  } else {
    res.send(`User "${req.body.username}" already exists.`)
  }
});
