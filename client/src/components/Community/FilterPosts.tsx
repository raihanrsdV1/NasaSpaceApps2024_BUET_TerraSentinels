import React, { useState } from "react";
import axios from "../../utils/AxiosSetup";
import AdvancedFilters from "./AdvancedFilters"; // Assuming this is your advanced filters component
import { Filters, Post } from "../../types/types"; // Import your Filters and Post types

interface FilterPostsProps {
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

const FilterPosts: React.FC<FilterPostsProps> = ({ setPosts }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    content: "", // content will be used directly in the search bar
    title: "",
    startDate: null,
    endDate: null,
    tags: [],
    isAlert: null,
  });

  const handleSearch = async () => {
    console.log(filters.tags);
    try {
      const params = {
        content: filters.content || undefined, // Using filters.content for search
        title: filters.title || undefined,
        start_date: filters.startDate ? filters.startDate.toISOString() : undefined,
        end_date: filters.endDate ? filters.endDate.toISOString() : undefined,
        tags: filters.tags.length ? filters.tags.join(",") : undefined,
        is_alert: filters.isAlert !== null ? filters.isAlert : undefined,
      };

      const response = await axios.get("/posts/filter/", { params });
      setPosts(response.data); // Update the post list
    } catch (error) {
      console.error("Error fetching filtered posts:", error);
    }
  };

  return (
    <div className="filter-posts flex flex-col w-full mb-6">
      {/* Search Bar */}
      <div className="flex w-full mb-4">
        <input
          type="text"
          placeholder="Search content..."
          value={filters.content} // bind filters.content to search input
          onChange={(e) =>
            setFilters((prevFilters) => ({ ...prevFilters, content: e.target.value }))
          }
          className="flex-grow p-4 border rounded-l-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="p-4 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition duration-200"
        >
          Search
        </button>
        <button
          onClick={() => setIsAdvancedOpen((prev) => !prev)}
          className="ml-2 p-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-200"
        >
          {isAdvancedOpen ? "Hide Advanced Features" : "Advanced Features"}
        </button>
      </div>

      {/* Conditionally render the AdvancedFilters popup */}
      {isAdvancedOpen && (
        <AdvancedFilters
          setFilters={setFilters}
          filters={filters}
          handleSearch={handleSearch}
            
        />
      )}
    </div>
  );
};

export default FilterPosts;
