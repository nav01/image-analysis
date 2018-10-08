const handleProfileGet = (req, res, db) => {
  const { id } = req.params;
  db.select('*').from('users').where({id}).then(user => {
    if(user.length)
      res.json(user[0]);
    else
      res.status(400).json('Not Found');
  })
  .catch(err => res.status(400).json('error getting user'));
}

//TODO: validate inputs
const handleProfileUpdate = (req, res, db) => {
	const {id} = req.params;
  const {name} = req.body;
  db('users').where({id}).update({name})
    .then(resp => {
      if (resp) {
        res.json({success: true})
      } else {
        res.status(400).json('Unable to update')
      }
    })
    .catch(err => res.status(400).json('error updating user'));
}

module.exports = {
  handleProfileGet,
  handleProfileUpdate,
}
