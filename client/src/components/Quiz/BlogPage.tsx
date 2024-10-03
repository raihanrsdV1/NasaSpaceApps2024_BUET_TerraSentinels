import React from "react";

interface Blog {
  title: string;
  content: string;
}

interface BlogPageProps {
  blog: Blog;
  onClose: () => void; // Function to close the modal
}

const BlogPage: React.FC<BlogPageProps> = ({ blog, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative">
        <h2 className="text-2xl font-bold text-green-600 mb-4">{blog.title}</h2>
        <button onClick={onClose} className="absolute top-3 right-5 text-gray-600 hover:text-red-500">
          X
        </button>
        <div className="mt-4">
          <p>{blog.content}</p>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
