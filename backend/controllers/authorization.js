const redisClient = require('./signin').redisClient;

const requireAuth = (req, res, next) => {
	const {authorization} = req.headers;
	console.log(authorization);
	if (!authorization) 
		return res.status(401).json('Unauthorized.');
	return redisClient.get(authorization, (err, reply) => {
		console.log(authorization);
		if (err || !reply)
			return res.status(401).json('Unauthorized.');
		return next();
	})
}

module.exports = {
	requireAuth
}