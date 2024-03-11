const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('./models/user'); // Assuming there is a User model in models/user.js
const mongoose = require('mongoose');

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(bodyParser.json());
app.use(cookieSession({
  name: 'session',
  keys: [process.env.COOKIE_KEY],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.post('/api/google-signin', async (req, res) => {
  const { token }  = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];

    // Check if user already exists in database
    let user = await User.findOne({ googleId: userid });
    if (!user) {
      // If user does not exist, create a new user
      user = new User({
        googleId: userid,
        email: payload['email'],
        name: payload['name'],
        picture: payload['picture']
      });
      await user.save();
    }

    // Set user session
    req.session.userId = user._id;
    res.status(200).json({ message: 'User signed in successfully', user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid Google token', error: error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});