const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const session = require('./controllers/session');

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.POSTGRES_URI,
    ssl: process.env.NODE_ENV === 'development' ? false : true,
  }
});


const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => res.send('it is working'));
app.post('/signin', signin.signinAuth(db, bcrypt));
app.post('/signout', session.requireAuth, session.signout);
app.post('/register', (req, res) => register.handleRegister(req, res, db, bcrypt));
app.get('/profile/:id', session.requireAuth, (req, res) => profile.handleProfileGet(req, res, db));
app.post('/profile/:id', session.requireAuth, (req, res) => profile.handleProfileUpdate(req, res, db));
app.put('/image', session.requireAuth, (req, res) => image.handleImage(req, res, db));
app.post('/imageurl', session.requireAuth, (req, res) => image.handleClarifaiCall(req, res));

app.listen(process.env.PORT, () => {
  console.log(`listening on ${process.env.PORT}`);
});
