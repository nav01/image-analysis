const jwt = require('jsonwebtoken');
const redis = require('redis');

const redisClient = redis.createClient(process.env.REDIS_URI);

const handleSignin = (req, res, db, bcrypt) => {
  const {email, password} = req.body;
  if (!email || !password)
    return Promise.reject('incorrect-form-submission');
  return db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if(isValid)
        return db.select('*').from('users')
          .where('email', '=', req.body.email)
          .then(user => user[0])
          .catch(err => Promise.reject('unable to get user'));
      else
        Promise.reject('wrong credentials')
    })
    .catch(err => Promise.reject('wrong credentials'));
}

const getAuthTokenId = (req,res) => {
  const {authorization} = req.headers;
  redisClient.get(authorization, (err, reply) => {
    if (err || !reply)
      return res.status(400).json('Unauthorized.');
    else
      return res.json({id: reply});
  })
}

const signToken = (email) => {
  const jwtPayload = {email};
  return jwt.sign(jwtPayload, process.env.JWT_SECRET)
}

const setToken = (token, id) => {
  return Promise.resolve(redisClient.set(token, id));
}

const createSession = (user) => {
  const {email, id, name, entries, joined} = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => {
      console.log('success')
      return {success: 'true', id, name, entries, joined, token}
    })
    .catch(() => console.log('problem'));
}

const signinAuth = (db, bcrypt) => (req, res) => {
  const {authorization} = req.headers;
  return authorization ? getAuthTokenId(req, res) : 
    handleSignin(req, res, db, bcrypt)
      .then(data => {
        if (data.id && data.email)
          return createSession(data)
        else 
          Promise.reject(data)
      })
      .then(session => res.json(session))
      .catch(err => res.status(400).json(err));
}

module.exports = {
  signinAuth,
  redisClient,
}
