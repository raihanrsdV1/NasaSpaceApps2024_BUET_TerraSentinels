import { useEffect, useState } from "react";
import axios from "../../utils/AxiosSetup";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";

const CommunityHome = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get("post/all/");
          setPosts(response.data);
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      };

      fetchData();
    }, []);

    return (
      <div className="flex">
        {/* Fixed Navbar */}
        <Navbar />
        {/* Sidebar and content container */}
        <Sidebar />
        <div className="flex w-full pt-16">
          <div className="w-5/6 p-6">
            <h1 className="text-2xl font-bold mb-4">Community</h1>
            <div>
              {posts.length > 0 ? (
                posts.map((post: any) => (
                  <div key={post.id} className="mb-4 p-4 border border-gray-300 rounded-lg shadow">
                    <h2 className="text-xl font-semibold">{post.title}</h2>
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