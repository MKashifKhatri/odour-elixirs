// src/app/admin/[ADMIN_SECRET_PATH]/apps/stopwatch/page.tsx
"use client"
import { useState, useEffect } from 'react';

const Stopwatch = () => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const resetHandler = () => {
    setTime(0);
    setIsRunning(false);
  };

  useEffect(() => {
    let intervalID: NodeJS.Timeout;
    if (isRunning) {
      intervalID = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      clearInterval(intervalID);
    };
  }, [isRunning]);

  return (
      <div className="admin-container flex flex-col items-center justify-center h-full bg-gray-100 p-4 overflow-hidden">
        <section className="dashboard-app-container p-6 bg-white rounded-lg shadow-md max-w-md w-full overflow-hidden">
          <h1 className="text-2xl font-bold mb-4 text-center">Stopwatch</h1>
          <section className="flex flex-col items-center">
            <div className="stopwatch text-center mb-4">
              <h2 className="text-5xl font-semibold md:text-6xl">{formatTime(time)}</h2>
            </div>
            <div className="flex justify-center flex-col sm:flex-row sm:space-x-4 w-full">
              <button
                className="mt-4 sm:mt-0 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition w-full sm:w-auto"
                onClick={() => setIsRunning((prev) => !prev)}
              >
                {isRunning ? "Stop" : "Start"}
              </button>
              <button
                className="mt-2 sm:mt-0 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition w-full sm:w-auto"
                onClick={resetHandler}
              >
                Reset
              </button>
            </div>
          </section>
        </section>
      </div>
  );
};

// Helper function to format time
const formatTime = (timeInSeconds: number) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default Stopwatch;