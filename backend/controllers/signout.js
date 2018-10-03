const redisClient = require('./signin').redisClient;

const signout = (req, res) => {
	const {authorization} = req.headers;
	console.log('Key Deleted?', redisClient.del(authorization));
	res.status(200).json({success: true});

};

module.exports = {
	signout,
}