const session = require('./session');

const insertLogin = (trx, hash, email) => {
  return trx.insert({
      hash: hash,
      email: email,
    })
    .into('login')
    .returning('email')
}

const insertUser = (trx, email, name) => {
  return trx('users')
    .returning('*')
    .insert({
      email: email,
      name: name,
      joined: new Date()
    })
}

const handleRegister = (req, res, db, bcrypt) => {
  const {email, name, password} = req.body;
  if (!email || !name || !password)
    return res.status(400).json('incorrect form submission');
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    insertLogin(trx, hash, email)
    .then(loginEmail => {
      return insertUser(trx, loginEmail[0], name)
      .then(user => {
        console.log('before session:', user[0])
        session.createSession(user[0])
        .then(session => {
          console.log('session is:', session);
          res.json(session);
        });
      })
    })
    .then(trx.commit)
    .catch(trx.rollback);
  })
  .catch(err => res.status(400).json('unable to register'));
};

module.exports = {
  handleRegister,
}
