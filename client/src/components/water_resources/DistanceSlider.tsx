import React from "react";

interface DistanceSliderProps {
  maxDistance: number;
  setMaxDistance: (value: number) => void;
}

const DistanceSlider: React.FC<DistanceSliderProps> = ({
  maxDistance,
  setMaxDistance,
}) => {
  return (
    <div className="flex justify-center items-center p-2">
      <div className="w-full max-w-lg p-6 bg-green-50 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold text-green-700 mb-2">
          Adjust Search Radius
        </h2>
        <p className="text-gray-700 mb-4">
          Use the slider to set the maximum distance for searching water
          sources.
        </p>

        {/* Slider Input */}
        <input
          type="range"
          min="1"
          max="5"
          value={maxDistance}
          onChange={(e) => setMaxDistance(Number(e.target.value))}
          className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Current Distance */}
        <div className="text-center mt-4 text-green-700 font-semibold">
          <span>Current Distance: {maxDistance} km</span>
        </div>
      </div>
    </div>
  );
};

export default DistanceSlider;
