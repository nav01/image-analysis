const jwt = require('jsonwebtoken');
const redis = require('redis');

const redisClient = redis.createClient(process.env.REDIS_URI);

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

const requireAuth = (req, res, next) => {
  const {authorization} = req.headers;
  if (!authorization) 
    return res.status(401).json('Unauthorized.');
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply)
      return res.status(401).json('Unauthorized.');
    return next();
  })
}

const signout = (req, res) => {
  const {authorization} = req.headers;
  console.log('Key Deleted?', redisClient.del(authorization));
  res.json({success: true});

};

module.exports = {
  createSession,
  getAuthTokenId,
  requireAuth,
  signout,
}