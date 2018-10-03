const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const signout = require('./controllers/signout');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const auth = require('./controllers/authorization');

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
app.post('/signout', auth.requireAuth, signout.signout);
app.post('/register', (req, res) => register.handleRegister(req, res, db, bcrypt));
app.get('/profile/:id', auth.requireAuth, (req, res) => profile.handleProfileGet(req, res, db));
app.post('/profile/:id', auth.requireAuth, (req, res) => profile.handleProfileUpdate(req, res, db));
app.put('/image', auth.requireAuth, (req, res) => image.handleImage(req, res, db));
app.post('/imageurl', auth.requireAuth, (req, res) => image.handleClarifaiCall(req, res));

app.listen(process.env.PORT, () => {
  console.log(`listening on ${process.env.PORT}`);
});
