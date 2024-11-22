import React from 'react';
import { motion } from 'framer-motion';

export function Slider({ min, max, value, onChange, className }) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        />
        <motion.div
          initial={false}
          animate={{
            left: `${((value - min) / (max - min)) * 100}%`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute -top-6 transform -translate-x-1/2"
        >
          <span className="px-2 py-1 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm">
            {value}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
