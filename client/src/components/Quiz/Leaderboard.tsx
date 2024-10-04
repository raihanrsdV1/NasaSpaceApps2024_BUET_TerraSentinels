import React, { useState, useEffect } from "react";
import axios from "../../utils/AxiosSetup";

interface LeaderboardEntry {
  id: number;
  user_info: {
    phone_no: string;
  };
  quiz_taking_start: string;
  quiz_time_end: string;
}

interface LeaderboardProps {
  quizId: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ quizId }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const response = await axios.get(`/quiz/${quizId}/leaderboard/`);
      setLeaderboard(response.data);
    };
    fetchLeaderboard();
  }, [quizId]);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-green-600 mb-6">Leaderboard</h2>
      <table className="table-auto w-full bg-white shadow-lg rounded-lg">
        <thead>
          <tr className="bg-green-200 text-left">
            <th className="p-4">Rank</th>
            <th className="p-4">Username</th>
            <th className="p-4">Quiz Start Time</th>
            <th className="p-4">Quiz End Time</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr
              key={entry.id}
              className={`${
                index % 2 === 0 ? "bg-white" : "bg-green-100"
              } border-b`}
            >
              <td className="p-4">{index + 1}</td> {/* Rank */}
              <td className="p-4">{entry.user_info.phone_no}</td> {/* Username */}
              <td className="p-4">{new Date(entry.quiz_taking_start).toLocaleString()}</td> {/* Quiz Start Time */}
              <td className="p-4">{new Date(entry.quiz_time_end).toLocaleString()}</td> {/* Quiz End Time */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
