// QuizList.tsx
import React, { useState, useEffect } from "react";
import axios from "../../utils/AxiosSetup"; // Adjust the path as necessary

interface Option {
  id: number;
  text: string;
}

interface Quiz {
  id: number;
  question: string;
  options: Option[];
  explanation: string;
}

interface QuizListProps {
  topicId: number; // Ensure topicId is included here
  setSelectedQuiz: (quiz: Quiz) => void; // Function to set the selected quiz
  onBack: () => void; // Function to go back to the topic list
}

const QuizList: React.FC<QuizListProps> = ({ topicId, setSelectedQuiz, onBack }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const response = await axios.get(`/api/quizzes/?topic=${topicId}`);
      setQuizzes(response.data);
    };
    fetchQuizzes();
  }, [topicId]);

  return (
    <div className="p-8">
      <div className="flex justify-between mb-4">
        <h2 className="text-3xl font-bold text-green-600">Select a Quiz</h2>
        <button
          onClick={onBack} // Call the onBack function to go back
          className="text-green-500 hover:underline"
        >
          Back to Topics
        </button>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {quizzes.map((quiz, index) => (
          <li
            key={quiz.id}
            className="bg-green-200 hover:bg-green-300 cursor-pointer rounded-lg p-4 shadow-lg transition-all"
            onClick={() => setSelectedQuiz(quiz)}
          >
            Quiz {index + 1} {/* Show quiz as Quiz 1, Quiz 2, etc. */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;
