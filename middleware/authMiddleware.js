const jwt = require('jsonwebtoken');
const User = require('../models/User'); // importing a model of user

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt; // create a token

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'xfoMa2pPlRosdyqzc3MPjvOWppGOiXnGQnD91sV8ynA4zZ9hsT8USWriEgU9HCJ', (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        // console.log(decodedToken.id);
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'xfoMa2pPlRosdyqzc3MPjvOWppGOiXnGQnD91sV8ynA4zZ9hsT8USWriEgU9HCJ', async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};


module.exports = { requireAuth, checkUser };
