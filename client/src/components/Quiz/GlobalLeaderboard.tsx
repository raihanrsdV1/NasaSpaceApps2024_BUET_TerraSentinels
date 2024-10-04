import React, { useEffect, useState } from "react";
import axios from "../../utils/AxiosSetup";

interface GlobalLeaderboardEntry {
    first_name: string;
    correct_solved: number;
    cumulative_time: number; // Store as number for easier formatting
    total_time: number; // Store as number for easier formatting
}

interface GlobalLeaderboardProps {
    onClose: () => void; // Function to close the modal
}

const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ onClose }) => {
    const [leaderboard, setLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get("quiz/leaderboard/global/");
                setLeaderboard(response.data);
            } catch (error) {
                console.error("Error fetching global leaderboard:", error);
                alert("An error occurred while fetching the leaderboard. Please try again later.");
            }
        };

        fetchLeaderboard();
    }, []);

    const formatTime = (seconds: number): string => {
        const totalSeconds = Math.round(seconds); // Round to nearest second
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;

        if (minutes > 0) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
        } else {
            return `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
        }
    };

    if (!leaderboard.length) {
        return <div className="text-center text-gray-600">No leaderboard data available.</div>;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <h2 className="text-2xl font-bold text-green-600 mb-4">Global Leaderboard</h2>
                <button onClick={onClose} className="absolute top-3 right-5 text-gray-600 hover:text-red-500">
                    X
                </button>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr className="bg-green-200">
                            <th className="px-4 py-2 text-left text-green-700">Rank</th>
                            <th className="px-4 py-2 text-left text-green-700">User</th>
                            <th className="px-4 py-2 text-left text-green-700">Correct Solved</th>
                            <th className="px-4 py-2 text-left text-green-700">Cumulative Time</th>
                            <th className="px-4 py-2 text-left text-green-700">Total Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {leaderboard.map((entry, index) => (
                            <tr key={index} className={`${index % 2 === 0 ? "bg-green-100" : "bg-white"} hover:bg-green-200 transition-all`}>
                                <td className="px-4 py-2 text-center">{index + 1}</td>
                                <td className="px-4 py-2 text-center">{entry.first_name}</td>
                                <td className="px-4 py-2 text-center">{entry.correct_solved}</td>
                                <td className="px-4 py-2 text-center">{formatTime(entry.cumulative_time)}</td>
                                <td className="px-4 py-2 text-center">{formatTime(entry.total_time)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GlobalLeaderboard;
