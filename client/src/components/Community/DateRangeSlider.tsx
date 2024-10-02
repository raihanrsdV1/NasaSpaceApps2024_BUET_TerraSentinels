import React, { useState, useEffect } from "react";
import { Range, getTrackBackground } from "react-range";

interface DateRangeSliderProps {
  startDate: Date;
  endDate: Date;
  selectedStartDate?: Date | null;
  selectedEndDate?: Date | null;
  onChange: (range: { startDate: Date; endDate: Date }) => void;
}

const DateRangeSlider: React.FC<DateRangeSliderProps> = ({
  startDate,
  endDate,
  selectedStartDate,
  selectedEndDate,
  onChange,
}) => {
  const step = 86400000; // One day in milliseconds

  // Initialize the state with start and end date timestamps
  const [values, setValues] = useState([
    selectedStartDate ? selectedStartDate.getTime() : startDate.getTime(),
    selectedEndDate ? selectedEndDate.getTime() : endDate.getTime(),
  ]);

  // Update values if selectedStartDate or selectedEndDate changes
  useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      setValues([selectedStartDate.getTime(), selectedEndDate.getTime()]);
    }
  }, [selectedStartDate, selectedEndDate]);

  // Handle slider changes
  const handleSliderChange = (newValues: number[]) => {
    setValues(newValues);
    const [start, end] = newValues;
    onChange({
      startDate: new Date(start),
      endDate: new Date(end),
    });
  };

  return (
    <div className="date-range-slider" style={{ padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", backgroundColor: "#f8f9fa" }}>
      <h3 style={{ textAlign: "center", color: "#333" }}>Select Date Range</h3>
      {/* Range Slider */}
      <Range
        step={step}
        min={startDate.getTime()}
        max={endDate.getTime()}
        values={values}
        onChange={handleSliderChange}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            style={{
              height: "6px",
              width: "100%",
              margin: "10px 0",
              background: getTrackBackground({
                values,
                colors: ["#ddd", "#4CAF50", "#ddd"],
                min: startDate.getTime(),
                max: endDate.getTime(),
              }),
              borderRadius: "4px",
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props, index }) => (
          <div
            {...props}
            style={{
              height: "20px",
              width: "20px",
              padding: "4px",
              margin: "10px",
              backgroundColor: "#4CAF50",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              transition: "background-color 0.2s",
              marginTop: index === 1 ? '-30px' : '0',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#45a049")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4CAF50")}
          />
        )}
      />

      {/* Date Display */}
      <div style={{ marginTop: "10px", textAlign: "center", color: "#333" }}>
        <span style={{ fontWeight: "bold" }}>{new Date(values[0]).toLocaleDateString()}</span> -{" "}
        <span style={{ fontWeight: "bold" }}>{new Date(values[1]).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default DateRangeSlider;
