// QuizPage.tsx
import React, { useState, useEffect } from "react";
import axios from "../../utils/AxiosSetup"; // Adjust the path as necessary
import TopicList from "./TopicList";
import QuizList from "./QuizList";
import Quiz from "./Quiz";
import Leaderboard from "./Leaderboard";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import BlogList from "./BlogList"; // Import BlogList
import GlobalLeaderboard from "./GlobalLeaderboard"; // Import the new global leaderboard component
interface Topic {
  id: number;
  name: string;
  description: string;
}

const QuizPage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]); // State to hold topics
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isGlobalLeaderboardOpen, setGlobalLeaderboardOpen] = useState(false);

  // Fetch topics from the backend
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get("/topics/all/"); // Adjust the API endpoint as needed
        setTopics(response.data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, []);

  const handleBackToTopics = () => {
    setSelectedQuiz(null); // Reset the selected quiz
    setSelectedTopic(null); // Reset the selected topic
  };

  const handleBackToList = () => {
    setSelectedQuiz(null);  // This will reset the quiz selection and go back to the list
  };

  const handleQuizEnd = () => {
    handleBackToList();
  };

  const toggleGlobalLeaderboard = () => {
    setGlobalLeaderboardOpen(!isGlobalLeaderboardOpen);
  };
  

  return (
    <div className="flex">
      <Sidebar />
      <Navbar />
      <div className="quiz-page p-8 bg-gray-100 min-h-screen mt-10 w-full">
      <div className="flex justify-center mt-5">
        <button
            onClick={toggleGlobalLeaderboard}
            className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
        Show Global Leaderboard
        </button>
        </div>
        {!selectedTopic && (
          <div>
          <TopicList topics={topics} setSelectedTopic={setSelectedTopic} />
        </div>
        )}
        {selectedTopic && !selectedQuiz && (
           <>
           <QuizList
             topicId={selectedTopic}
             setSelectedQuiz={setSelectedQuiz}
             onBack={handleBackToTopics}
           />
           <BlogList topicId={selectedTopic} /> {/* Add BlogList here */}
         </>
          
        )}
        {selectedQuiz && (
          <div className="space-y-6">
            <Quiz selectedQuiz={selectedQuiz} onQuizEnd={handleQuizEnd} onGoBackToList={handleBackToList} />

            <Leaderboard quizId={selectedQuiz.id} />
          </div>
        )}
        {isGlobalLeaderboardOpen && (
          <GlobalLeaderboard onClose={toggleGlobalLeaderboard} />
        )}
      </div>
    </div>
  );
};

export default QuizPage;
