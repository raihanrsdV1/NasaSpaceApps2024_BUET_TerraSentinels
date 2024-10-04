import React, { useState, useEffect } from "react";
import axios from "../../utils/AxiosSetup";
import DateRangeSlider from "./DateRangeSlider"; // Assuming you use a separate component for the date slider
import { Filters } from "../../types/types"; // Import the Filters type

interface AdvancedFiltersProps {
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filters: Filters;
  handleSearch: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  setFilters,
  filters,
  handleSearch,
}) => {
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [startDateLimit, setStartDateLimit] = useState<Date | null>(null);
  const [endDateLimit, setEndDateLimit] = useState<Date | null>(null);
  const [initialStartDate, setInitialStartDate] = useState<Date | null>(null); // Track initial start date
  const [initialEndDate, setInitialEndDate] = useState<Date | null>(null); // Track initial end date
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  useEffect(() => {
    const fetchTagsAndDates = async () => {
        setLoading(true); // Set loading to true when fetching data
        try {
          const [tagsResponse, dateRangeResponse] = await Promise.all([
            axios.get("/tags/"),
            axios.get("/posts/date-range/"), // Updated endpoint to get date range
          ]);
      
          setTags(tagsResponse.data); // Ensure this returns an array of { id, name }
          const { oldest_post_date, newest_post_date } = dateRangeResponse.data;
          const oldestDate = new Date(oldest_post_date);
          const newestDate = new Date(newest_post_date);
      
          if (oldestDate.getTime() === newestDate.getTime()) {
            // If the dates are the same, set both to that date
            setStartDateLimit(oldestDate);
            setEndDateLimit(oldestDate); // or handle this case differently
          } else {
            setStartDateLimit(oldestDate);
            setEndDateLimit(newestDate);
          }
      
          setInitialStartDate(oldestDate); // Store initial start date
          setInitialEndDate(newestDate); // Store initial end date
        } catch (error) {
          console.error("Error fetching tags and date limits:", error);
        } finally {
          setLoading(false); // Set loading to false after fetching
        }
      };
      

    fetchTagsAndDates();
  }, []);

  const toggleTag = (tag: { id: number; name: string }) => {
    setFilters((prevFilters) => {
      const updatedTags = prevFilters.tags ? [...prevFilters.tags] : [];

      if (updatedTags.includes(tag.name)) {
        return { ...prevFilters, tags: updatedTags.filter((t) => t !== tag.name) };
      } else {
        return { ...prevFilters, tags: [...updatedTags, tag.name] };
      }
    });
  };

  const clearAllFilters = () => {
    setFilters({
      content: "",
      title: "",
      startDate: initialStartDate, // Reset to initial fetched date
      endDate: initialEndDate, // Reset to initial fetched date
      tags: [],
      isAlert: null,
    });
    handleSearch();
  };

  return (
    <div className="advanced-filters-popup bg-white p-4 rounded-lg shadow-lg">
      {loading ? (
        <p className="text-gray-700">Loading...</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search by Title"
            value={filters.title || ""}
            onChange={(e) =>
              setFilters((prevFilters) => ({ ...prevFilters, title: e.target.value }))
            }
            className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

{startDateLimit && endDateLimit && startDateLimit.getTime() !== endDateLimit.getTime() && (
  <DateRangeSlider
    startDate={startDateLimit}
    endDate={endDateLimit}
    selectedStartDate={filters.startDate ? new Date(filters.startDate) : null}
    selectedEndDate={filters.endDate ? new Date(filters.endDate) : null}
    onChange={({ startDate, endDate }) =>
      setFilters((prevFilters) => ({
        ...prevFilters,
        startDate: startDate || null,
        endDate: endDate || null,
      }))
    }
  />
)}


          <h3 className="text-lg font-semibold mb-2">Tags</h3>
          <div className="tag-selection flex flex-wrap mb-4">
            {tags.map((tag) => (
              <button
                key={tag.id}
                className={`tag-button m-1 px-4 py-2 rounded ${
                  filters.tags.includes(tag.name) ? "bg-green-500 text-white" : "bg-gray-200"
                } hover:bg-green-600 transition duration-200`}
                onClick={() => toggleTag(tag)}
              >
                {tag.name}
              </button>
            ))}
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              className="mr-2"
              checked={filters.isAlert === true}
              onChange={() =>
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  isAlert: filters.isAlert === true ? null : true,
                }))
              }
            />
            <label className="text-gray-700">Alert Only</label>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleSearch}
              className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200 mr-2"
            >
              Apply Filters
            </button>
            <button
              onClick={clearAllFilters}
              className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
            >
              Clear All
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdvancedFilters;
