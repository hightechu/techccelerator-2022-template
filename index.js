const express = require('express');
const app = express()
const authjs = require('./auth.js');
const auth = authjs.auth;
const path = require('path');
const db = authjs.db;
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
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  // ROUTING EXAMPLES
  .get('/', (req, res) => res.render('pages/index', { title: 'Home' }))
  .get('/help', (req, res) => res.render('pages/help', { title: 'Help' }))
  // ROUTING STARTS HERE



  // ROUTING ENDS HERE
  .use('/auth', auth)
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
