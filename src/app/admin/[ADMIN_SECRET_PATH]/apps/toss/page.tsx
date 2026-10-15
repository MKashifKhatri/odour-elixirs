"use client"
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../_components/AdminLayout";

type CoinSide = "heads" | "tails";

export default function Toss() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);

  const handleFlip = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);

    setTimeout(() => {
      const newResult = Math.random() < 0.5 ? "heads" : "tails";
      setResult(newResult);
      setIsFlipping(false);
    }, 1500); // Match animation duration
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Coin Flip
        </h1>
        <p className="text-gray-600">Click the coin to flip!</p>
      </div>

      <div 
        className={`relative w-48 h-48 cursor-pointer transform transition-transform hover:scale-105`}
        onClick={handleFlip}
      >
        <motion.div
          animate={{
            rotateX: isFlipping ? 1080 : 0, // 3 full flips
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="w-full h-full relative preserve-3d"
        >
          <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-yellow-300 to-yellow-400 shadow-lg flex items-center justify-center text-yellow-800 font-bold text-2xl border-4 border-yellow-500">
            {result === null ? "TOSS" : result.toUpperCase()}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 text-2xl font-bold text-gray-700"
          >
            {`It's ${result.toUpperCase()}!`}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleFlip}
        disabled={isFlipping}
        className={`mt-8 px-8 py-3 rounded-full font-semibold transform transition 
          bg-gradient-to-r from-blue-500 to-purple-500 text-white
          hover:from-blue-600 hover:to-purple-600 hover:scale-105
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg`}
      >
        {isFlipping ? "Flipping..." : "Flip Coin"}
      </button>
    </div>
  );
}