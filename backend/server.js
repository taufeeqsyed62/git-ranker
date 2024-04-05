import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [codeforcesId, setCodeforcesId] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [collegeRank, setCollegeRank] = useState(null);

  const handleCodeforcesIdChange = (e) => {
    setCodeforcesId(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/api/addUsername', { codeforcesId });

      const response = await axios.get(`http://localhost:5000/api/getUserInfo/${codeforcesId}`);
      const userData = response.data;

      await axios.post('http://localhost:5000/api/updateMongoDB', { 
        codeforcesId, 
        maxRating: userData.maxRating, 
        contests: userData.contests, 
        problemsSolved: userData.problemsSolved, 
        friends: userData.friends, 
        contributions: userData.contributions,
        rating: userData.rating 
      });

      setUserInfo(userData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGetCollegeRank = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/getCollegeRank/${codeforcesId}`);
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

      {userInfo && (
        <div>
          <p>Your Rating: {userInfo.rating}</p>
          <p>Your Max Rating: {userInfo.maxRating}</p>
          <p>Contests Participated: {userInfo.contests}</p>
          <p>Problems Solved: {userInfo.problemsSolved}</p>
          <p>Friends: {userInfo.friends}</p>
          <p>Contributions: {userInfo.contributions}</p>
          
        </div>
      )}

      <button onClick={handleGetCollegeRank}>Get College Rank</button>

      {collegeRank && <p>Your College Rank: {collegeRank}</p>}
    </div>
  );
};

export default App;
