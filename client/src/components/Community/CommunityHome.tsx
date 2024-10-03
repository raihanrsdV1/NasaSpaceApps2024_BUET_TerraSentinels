import { useEffect, useState } from "react";
import axios from "../../utils/AxiosSetup";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import FilterPosts from "./FilterPosts";
import { Post } from "../../types/types"; // Import the Post type

const CommunityHome = () => {
  const [posts, setPosts] = useState<Post[]>([]); // Initialize with Post type

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/post/all/");
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex">
      <Navbar />
      <Sidebar />
      
      <div className="flex w-full pt-16">
       
        <div className="w-5/6 p-6" style={{
          maxHeight: "100vh",
          overflowY: "scroll",
        }}>
          <FilterPosts setPosts={setPosts} />
          <h1 className="text-2xl font-bold mb-4">Community</h1>
          <div style={{
            maxHeight: "calc(100vh - 200px)",
            overflowY: "scroll",
          }}>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="mb-4 p-4 border border-gray-300 rounded-lg shadow">
                  <h2 className="text-xl font-semibold">{post.title}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{" "}
                        at {new Date(post.created_at).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    })}
                    </p>
                  {/* Display tags */}
              <div className="flex flex-wrap mb-2">
                {post.tag_names.map((tag, index) => (
                  <span key={index} className="bg-green-500 text-white text-sm font-medium mr-2 mb-2 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
                  <p>{post.content}</p>
                </div>
              ))
            ) : (
              <p>No posts available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHome;
