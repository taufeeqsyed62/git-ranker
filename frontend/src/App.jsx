import React, { useState } from 'react';
import axios from 'axios';


const App = () => {
  const [codeforcesId, setCodeforcesId] = useState('');
  const [maxRating, setMaxRating] = useState(null);
  const [collegeRank, setCollegeRank] = useState(null);

  const handleCodeforcesIdChange = (e) => {
    setCodeforcesId(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      // Add username to API
      await axios.post('http://localhost:5000/api/addUsername', { codeforcesId }); // Update URL to use port 5000

      // Get maxRating from Codeforces API
      const response = await axios.get(`http://localhost:5000/api/getMaxRating/${codeforcesId}`); // Update URL to use port 5000
      setMaxRating(response.data.maxRating);

      // Update MongoDB with maxRating
      await axios.post('http://localhost:5000/api/updateMongoDB', { codeforcesId, maxRating: response.data.maxRating }); // Update URL to use port 5000

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGetCollegeRank = async () => {
    try {
      // Fetch college rank based on maxRating
      const response = await axios.get(`http://localhost:5000/api/getCollegeRank/${maxRating}`); // Update URL to use port 5000
      setCollegeRank(response.data.collegeRank);

    } catch (error) { 
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Codeforces Ranking System</h1>
      <label htmlFor="codeforcesId">Enter Codeforces ID:</label>
      <input type="text" id="codeforcesId" value={codeforcesId} onChange={handleCodeforcesIdChange} />
      <button onClick={handleSubmit}>Submit</button>

      {maxRating && <p>Your Max Rating: {maxRating}</p>}

      <button onClick={handleGetCollegeRank}>Get College Rank</button>

      {collegeRank && <p>Your College Rank: {collegeRank}</p>}
    </div>
  );
};

export default App;
