const express = require('express');
const normalize = require('normalize-url');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route:    GET api/profile/me
// @descrip:  get current user profile
// @access:   private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);

    if(!profile) {
      return res.status(400).json({ msg: 'No profile for this user' });
    }

    res.json(profile);

  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route:    POST api/profile
// @descrip:  create/update user profile
// @access:   private
router.post('/', [ 
  auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
  ]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // build profile object
    const profileFields = {
      user: req.user.id,
      company,
      location,
      website: website && website !== '' ? normalize(website, { forceHttps: true }) : '',
      bio,
      skills: Array.isArray(skills)
        ? skills
        : skills.split(',').map((skill) => ' ' + skill.trim()),
      status
    };

    const socialfields = { youtube, twitter, instagram, linkedin, facebook };

    for (const [key, value] of Object.entries(socialfields)) {
      if (value && value.length > 0)
        socialfields[key] = normalize(value, { forceHttps: true });
    }
    profileFields.social = socialfields;

    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return res.json(profile);
    } catch(err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route:    GET api/profile
// @descrip:  get all profiles
// @access:   public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      'user', ['name', 'avatar']
    );
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route:    GET api/profile/user/user_id
// @descrip:  get profile by user id
// @access:   public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate(
      'user', ['name', 'avatar']
    );
    if(!profile) {
      return res.status(400).json({ msg: 'Profile not found.' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if(err.kinf === 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found.' });
    }
    res.status(500).send('Server error');
  }
});

// @route:    DELETE api/profile
// @descrip:  delete profile, user, & posts
// @access:   private
router.delete('/', auth, async (req, res) => {
  try {
    // remove user posts
    await Post.deleteMany({ user: req.user.id });

    // remove profile
    await Profile.findOneAndRemove({ user: req.user.id});

    // remove user
    await User.findOneAndRemove({ _id: req.user.id});

    res.json({ msg: 'User deleted'});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route:    PUT api/profile/experience
// @descrip:  add profile experience
// @access:   private
router.put('/experience', [auth, [
  check('title', 'Title is required').not().isEmpty(),
  check('company', 'Company is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  const {
    title, company, location,
    from, to, current, description
  } = req.body;

  const newExp = {
    title, company, location,
    from, to, current, description
  }

  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience.unshift(newExp);

    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route:    PUT api/profile/education
// @descrip:  add profile education
// @access:   private
router.put('/education', [auth, [
  check('school', 'School is required').not().isEmpty(),
  check('degree', 'Degree is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  const {
    school, degree, fieldofstudy,
    from, to, current, description
  } = req.body;

  const newEdu = {
    school, degree, fieldofstudy,
    from, to, current, description
  }

  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education.unshift(newEdu);

    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route:    DELETE api/profile/experience/:exp_id
// @descrip:  delete profile experience
// @access:   private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    profile.experience = profile.experience.filter(
      (exp) => exp._id.toString() !== req.params.exp_id
    );

    await profile.save();
    res.status(200).json(profile);
    
  } catch (err) {
    res.status(500).send('Server error')
  }
});

// @route:    DELETE api/profile/experience/:exp_id
// @descrip:  delete profile experience
// @access:   private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    profile.education = profile.education.filter(
      (edu) => edu._id.toString() !== req.params.edu_id
    );

    await profile.save();
    res.status(200).json(profile);
    
  } catch (err) {
    res.status(500).send('Server error')
  }
});

module.exports = router;