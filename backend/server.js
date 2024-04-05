const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 5000;
app.use(cors());
mongoose.connect('mongodb://localhost:27017/codeforcesrank', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once('open', () => console.log('Connected to MongoDB'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const userRankingSchema = new mongoose.Schema({
  codeforcesId: String,
  maxRating: Number,
  contests: Number,
  problemsSolved: Number,
  friends: Number,
  contributions: Number,
  rating: Number
});
const UserRanking = mongoose.model('UserRanking', userRankingSchema);

app.use(bodyParser.json());

app.post('/api/addUsername', async (req, res) => {
  const { codeforcesId } = req.body;
  try {
    const newUserRanking = new UserRanking({ codeforcesId });
    await newUserRanking.save();
    res.status(201).json({ message: 'Username added successfully' });
  } catch (error) {
    console.error('Error adding username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/getUserInfo/:codeforcesId', async (req, res) => {
  const { codeforcesId } = req.params;
  try {
    const response = await axios.get(`https://codeforces.com/api/user.info?handles=${codeforcesId}`);
    const { data } = response;
    if (data.status === 'OK') {
      const userInfo = {
        maxRating: data.result[0].maxRating,
        contests: data.result[0].contestCount,
        problemsSolved: data.result[0].problemCount,
        friends: data.result[0].friendOfCount,
        contributions: data.result[0].contribution,
        rating: data.result[0].rating
      };
      res.json(userInfo);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/updateMongoDB', async (req, res) => {
  const { codeforcesId, maxRating, contests, problemsSolved, friends, contributions, rating } = req.body;
  try {
    await UserRanking.updateOne({ codeforcesId }, { maxRating, contests, problemsSolved, friends, contributions, rating });
    res.json({ message: 'MongoDB updated successfully' });
  } catch (error) {
    console.error('Error updating MongoDB:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/getCollegeRank/:codeforcesId', async (req, res) => {
  const { codeforcesId } = req.params;
  try {
    const user = await UserRanking.findOne({ codeforcesId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const collegeRank = await UserRanking.countDocuments({ rating: { $gt: user.rating } });
    res.json({ collegeRank: collegeRank + 1 });
  } catch (error) {
    console.error('Error getting college rank:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
