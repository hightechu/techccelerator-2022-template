const express = require('express');
const app = express()
const { auth, db, session } = require('./auth.js')
const path = require('path');
const PORT = process.env.PORT || 5000


// DATABASE CONFIG
db.query("CREATE TABLE IF NOT EXISTS users ( \
  Username varchar(50) NOT NULL UNIQUE, \
  Password varchar(60) NOT NULL);"
);
// DEVELOPERS SHOULD ADD CODE HERE



// DEVELOPERS CODE ENDS HERE
app.use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded())
  .use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
  }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .use((req, res, next) => {
    res.locals.user = req.session.username
    next()
  })
  .use('/auth', auth)
  // ROUTING EXAMPLES
  .get('/', (req, res) => res.render('pages/index', { title: 'Home' }))
  .get('/help', (req, res) => res.render('pages/help', { title: 'Help'}))
  // ROUTING STARTS HERE



  // ROUTING ENDS HERE
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
