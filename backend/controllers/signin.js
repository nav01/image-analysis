const session = require('./session');

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

const signinAuth = (db, bcrypt) => (req, res) => {
  const {authorization} = req.headers;
  return authorization ? session.getAuthTokenId(req, res) : 
    handleSignin(req, res, db, bcrypt)
      .then(data => {
        if (data.id && data.email)
          return session.createSession(data)
        else 
          Promise.reject(data)
      })
      .then(session => res.json(session))
      .catch(err => res.status(400).json('unable to sign in'));
}

module.exports = {
  signinAuth,
}
