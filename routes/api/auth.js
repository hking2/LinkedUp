const express = require('express');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

const router = express.Router();

// @route:    GET api/auth
// @descrip:  get user by token
// @access:   public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route:    POST api/auth
// @descrip:  authenticate user & get token
// @access:   private
router.post('/', [
  check('email', 'Please include valid email').isEmail(),
  check('password', 'Password is required').exists()
],
  async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid user' }] });
    }

    // check if password matches email
    const pswdValid = await bcrypt.compare(password, user.password);
    if(!pswdValid) {
      return res.status(400).json({ errors: [{ msg: 'Invalid user' }] });
    }

    // return JWT
    const payload = {
      user: {
        id: user.id
      }
    }
    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: 360000 },
      (err, token) => {
        if(err) throw err;
        res.json({ token })
      });
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;