import React, { useEffect, useState } from "react";
import axios from "../../utils/AxiosSetup";
import BlogPage from "./BlogPage"; // Import the BlogPage component

interface Blog {
  id: number;
  title: string;
  content: string;
}

interface BlogListProps {
  topicId: number; // ID of the selected topic
}

const BlogList: React.FC<BlogListProps> = ({ topicId }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`/blogs/topic/${topicId}/`); // Adjust endpoint as necessary
        setBlogs(response.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, [topicId]);

  const handleBlogClick = (blog: Blog) => {
    setSelectedBlog(blog); // Set the selected blog to display in the modal
  };

  const handleCloseBlog = () => {
    setSelectedBlog(null); // Reset selected blog when closing
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-green-600 mb-6">Blogs for Topic</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {blogs.map((blog) => (
          <li
            key={blog.id}
            className="bg-green-200 hover:bg-green-300 cursor-pointer rounded-lg p-4 shadow-lg transition-all"
            onClick={() => handleBlogClick(blog)}
          >
            <h3 className="font-bold">{blog.title}</h3>
            <p>{blog.content.substring(0, 100)}...</p>
          </li>
        ))}
      </ul>
      {selectedBlog && <BlogPage blog={selectedBlog} onClose={handleCloseBlog} />} {/* Modal for BlogPage */}
    </div>
  );
};

export default BlogList;
