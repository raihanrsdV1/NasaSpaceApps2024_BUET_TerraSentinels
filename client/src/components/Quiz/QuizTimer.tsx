import React, { useEffect, useState } from "react";

interface QuizTimerProps {
  startTime: Date;
  running: boolean; // The running prop to control whether the timer is active or not
}

const QuizTimer: React.FC<QuizTimerProps> = ({ startTime, running }) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null; // Correct type for setInterval in browsers

    if (running) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = (now.getTime() - startTime.getTime()) / 1000; // Time difference in seconds
        setElapsedTime(diff);
      }, 1000);
    } else if (!running && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [running, startTime]);

  return (
    <div className="quiz-timer bg-green-100 p-4 rounded-lg shadow-md text-center mt-4">
      <span className="text-xl font-bold text-green-700">
        {`Time Elapsed: ${Math.floor(elapsedTime)} seconds`}
      </span>
    </div>
  );
};

export default QuizTimer;
