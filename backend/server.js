// server.js

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors'); 

const app = express();

const PORT = process.env.PORT || 5000; // Update port number to 5000
app.use(cors());
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/codeforcesrank', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once('open', () => console.log('Connected to MongoDB'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define schema and model for user rankings
const userRankingSchema = new mongoose.Schema({
  codeforcesId: String,
  maxRating: Number,
});
const UserRanking = mongoose.model('UserRanking', userRankingSchema);

app.use(bodyParser.json());

// Add username to API
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

// Get maxRating from Codeforces API
app.get('/api/getMaxRating/:codeforcesId', async (req, res) => {
  const { codeforcesId } = req.params;
  try {
    // Fetch user info from Codeforces API
    const response = await axios.get(`https://codeforces.com/api/user.info?handles=${codeforcesId}&checkHistoricHandles=false`);
    const { result } = response.data;
    if (result.length > 0) {
      const { maxRating } = result[0];
      res.json({ maxRating });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting maxRating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update MongoDB with maxRating
app.post('/api/updateMongoDB', async (req, res) => {
  const { codeforcesId, maxRating } = req.body;
  try {
    await UserRanking.updateOne({ codeforcesId }, { maxRating });
    res.json({ message: 'MongoDB updated successfully' });
  } catch (error) {
    console.error('Error updating MongoDB:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get college rank based on maxRating
app.get('/api/getCollegeRank/:maxRating', async (req, res) => {
  const { maxRating } = req.params;
  try {
    // Retrieve college rank from MongoDB based on maxRating
    const collegeRank = await UserRanking.countDocuments({ maxRating: { $gte: maxRating } });
    res.json({ collegeRank });
  } catch (error) {
    console.error('Error getting college rank:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
