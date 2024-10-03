import React, { useState } from "react";
import axios from "../../utils/AxiosSetup";
import QuizTimer from "./QuizTimer";
import Confetti from "react-confetti"; // Import confetti package

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

interface StartQuizResponse {
  quiz_taking_start: string;
  id: number;
}

interface EndQuizResponse {
  correct: boolean;
}

interface QuizProps {
    selectedQuiz: Quiz;
    onQuizEnd: () => void;
    onGoBackToList: () => void; // Add this prop to handle going back to the list
}



const Quiz: React.FC<QuizProps> = ({ selectedQuiz, onQuizEnd, onGoBackToList }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [quizSolveId, setQuizSolveId] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false); // State to track if quiz is completed
  const [userId, setUserId] = useState<number | null>(7); // Add user ID state
  const startQuiz = async () => {
    
    try {
      const response = await axios.post<StartQuizResponse>("/quiz/start/", {
        quiz_id: selectedQuiz.id,
        user_id: userId, // Replace with actual user ID
      });
      setStartTime(new Date(response.data.quiz_taking_start));
      setQuizSolveId(response.data.id);
      setTimerRunning(true); // Start the timer
    } catch (error) {
      console.error("Error starting quiz:", error);
    }
  };

  const submitAnswer = async () => {
    if (selectedOption !== null && quizSolveId !== null) {
      try {
        const response = await axios.post<EndQuizResponse>("/quiz/end/", {
          quiz_solve_id: quizSolveId,
          chosen_option: selectedOption,
          user_id: userId, // Replace with actual user ID
        });

        setCorrect(response.data.correct);
        setShowExplanation(true);
        setTimerRunning(false); // Stop the timer

        if (response.data.correct) {
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
          }, 3000);
        }

        // Mark quiz as completed
        setQuizCompleted(true);
      } catch (error) {
        console.error("Error submitting answer:", error);
      }
    }
  };

  const resetQuiz = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setCorrect(null);
    setStartTime(null);
  };

  return (
    <div className="p-8 bg-white shadow-lg rounded-lg mt-10">
      {showConfetti && <Confetti />}
      <h2 className="text-2xl font-bold mb-4 text-green-600">{selectedQuiz.question}</h2>
      {startTime && <QuizTimer startTime={startTime} running={timerRunning} />} {/* Timer */}
      <ul className="space-y-4 mt-5">
        {selectedQuiz.options.map((option) => (
          <li
            key={option.id}
            className={`p-4 rounded-lg shadow-lg cursor-pointer ${
              selectedOption === option.id
                ? correct === null
                  ? "bg-green-300" // Selected but not submitted
                  : correct && option.id === selectedOption
                  ? "bg-green-500 text-white" // Correct answer
                  : !correct && option.id === selectedOption
                  ? "bg-red-500 text-white" // Wrong answer
                  : "bg-gray-200" // Unselected options
                : "bg-gray-200" // Unselected options
            }`}
            onClick={() => !quizCompleted && setSelectedOption(option.id)} // Disable option selection if quiz is completed
          >
            {option.text}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {quizCompleted ? (
          <button
            onClick={onQuizEnd}
            className="w-full p-4 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-all"
          >
            End Quiz
          </button>
        ) : startTime ? (
          <button
            onClick={submitAnswer}
            className="w-full p-4 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={startQuiz}
            className="w-full p-4 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all"
          >
            Start Quiz
          </button>
        )}
      </div>

      {showExplanation && (
        <div className="mt-4 text-green-600">
          <h3 className="font-bold">Explanation:</h3>
          <p>{selectedQuiz.explanation}</p>
        </div>
      )}

      <button
        onClick={onGoBackToList}
        className="mt-4 p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Go Back to Quiz List
      </button>
    </div>
  );
};

export default Quiz;
