import { useContext, useEffect, useState } from "react";
import axios from "../../utils/AxiosSetup";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import FilterPosts from "./FilterPosts";
import { Post } from "../../types/types";
import CommentSection from "./CommentSection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import RightSidebar from "./RightSideBar";
import CreateEditModal from "./CreateEditModal";
import AuthContext from "../../context/AuthContext";

const CommunityHome = () => {
  const contextData = useContext(AuthContext);
  const userId = contextData?.user?.user_id;
  const [posts, setPosts] = useState<Post[]>([]);
  const [userVotes, setUserVotes] = useState<{ [key: number]: "upvoted" | "downvoted" | null }>({});
  const [showOptions, setShowOptions] = useState<{ [key: number]: boolean }>({});
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const [currentPost, setCurrentPost] = useState<Post | null>(null); // State to manage the post being edited
  const [currentPostId, setCurrentPostId] = useState<number | null>(null); // State to manage the ID of the post being edited

  const fetchData = async () => {
    try {
      const response = await axios.get("/post/all/");
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleMarkAnswered = async (postId: number) => {
    try {
      await axios.patch(`/posts/${postId}/mark_as_answered/`);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, is_answered: true } : post
        )
      );
    } catch (error) {
      console.error("Error marking post as answered:", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const toggleOptionsMenu = (postId: number) => {
    setShowOptions((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };
  

  // Handle Upvote
  const handleUpvote = async (postId: number) => {
    try {
      if (userVotes[postId] === "upvoted") {
        // Undo upvote
        await axios.delete("/post_ratings/delete/", {
          data: { post_id: postId, user: userId }, // Sending data with DELETE
        });
        setUserVotes((prevVotes) => ({ ...prevVotes, [postId]: null }));
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, upvotes_count: post.upvotes_count - 1 }
              : post
          )
        );
      } else {
        // Upvote or switch from downvote
        await axios.post("/post_ratings/add/", {
          upvote: true,      // Send upvote as true
          user: userId,      // Send user ID
          post_id: postId    // Send post ID
        });
        setUserVotes((prevVotes) => ({ ...prevVotes, [postId]: "upvoted" }));
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  upvotes_count: post.upvotes_count + 1, // Always add 1 for upvote
                  downvotes_count: post.downvotes_count - (userVotes[postId] === "downvoted" ? 1 : 0), // Remove 1 for downvote if switching
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error upvoting post:", error);
    }
  };
  
  const handleDownvote = async (postId: number) => {
    try {
      if (userVotes[postId] === "downvoted") {
        // Undo downvote
        await axios.delete("/post_ratings/delete/", {
          data: { post_id: postId, user: userId }, // Sending data with DELETE
        });
        setUserVotes((prevVotes) => ({ ...prevVotes, [postId]: null }));
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, downvotes_count: post.downvotes_count - 1 }
              : post
          )
        );
      } else {
        await axios.post("/post_ratings/add/", {
          upvote: false,     // Send upvote as false for downvote
          user: userId,      // Send user ID
          post_id: postId    // Send post ID
        });
        setUserVotes((prevVotes) => ({ ...prevVotes, [postId]: "downvoted" }));
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  downvotes_count: post.downvotes_count + 1, // Always add 1 for downvote
                  upvotes_count: post.upvotes_count - (userVotes[postId] === "upvoted" ? 1 : 0), // Remove 1 for upvote if switching
                }
              : post
          )
        );        
      }
    } catch (error) {
      console.error("Error downvoting post:", error);
    }
  };  

  // Handle Delete Post
  const handleDeletePost = async (postId: number) => {
    try {
      await axios.delete(`/post/delete/${postId}/`);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId)); // Remove deleted post from state
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Open modal with post data to edit
  const handleEditPost = (post: Post) => {
    setCurrentPostId(post.id); // Set the post ID to edit
    setCurrentPost(post); // Set the post to edit
    setIsModalOpen(true); // Open the modal
  };
  

  // Handle edited post submission
  const handlePostUpdated = async (postData: { title: string; content: string; tags: number[] }) => {
    try {
      const response = await axios.put(`/post/edit/${currentPost?.id}/`, postData);
      console.log("Post updated:", response.data);
      // Update the local state with the updated post
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === currentPost?.id ? { ...post, ...postData } : post))
      );
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setIsModalOpen(false); // Close the modal after submission
      setCurrentPost(null); // Reset the current post

      fetchData(); // Refetch posts to update the UI
    }
  };

  return (
    <div className="flex">
      <Navbar />
      <Sidebar />
      
      <div className="flex w-full pt-16">
        <div className="w-5/6 p-6" style={{ maxHeight: "100vh", overflowY: "scroll" }}>
          <FilterPosts setPosts={setPosts} />
          <h1 className="text-2xl font-bold mb-4">Community</h1>
          <div style={{ maxHeight: "calc(100vh - 200px)", overflowY: "scroll" }}>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="relative mb-4 p-4 border border-gray-300 rounded-lg shadow">
                  <h2 className="text-xl font-semibold">{post.title}</h2>
                  <p className="text-sm text-gray-500">By {post.user_info.first_name} {post.user_info.last_name}</p>
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

                  {/* Upvote and Downvote */}
                  <div className="flex items-center mb-2">
                    {/* Upvote Button */}
                    <button
                      onClick={() => handleUpvote(post.id)}
                      className="flex items-center"
                    >
                      <FontAwesomeIcon
                        icon={faArrowUp}
                        className={`${userVotes[post.id] === "upvoted" ? "text-blue-500" : "text-gray-500"}`}
                      />
                    </button>

                    {/* Display Net Votes */}
                    <span className="mx-2">
                      {post.upvotes_count - post.downvotes_count}
                    </span>

                    {/* Downvote Button */}
                    <button
                      onClick={() => handleDownvote(post.id)}
                      className="flex items-center"
                    >
                      <FontAwesomeIcon
                        icon={faArrowDown}
                        className={`${userVotes[post.id] === "downvoted" ? "text-red-500" : "text-gray-500"}`}
                      />
                    </button>

                    {/* 3-dot Options Menu */}
                    {post.user === userId && (
                      <div className="ml-auto relative">
                        <button onClick={() => toggleOptionsMenu(post.id)} className="text-gray-500">
                          <FontAwesomeIcon icon={faEllipsisH} size="2x"/>
                        </button>

                        {showOptions[post.id] && (
                          <div className="absolute right-0 mt-2 w-25 bg-white border rounded shadow-lg">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="block w-full text-left px-4 py-2 hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="block w-full text-left px-4 py-2 hover:bg-red-700"
                            >
                              Delete
                            </button>
                            {post.is_question && !post.is_answered && (
                              <button
                                onClick={() => handleMarkAnswered(post.id)}
                                className="block w-full text-left px-4 py-2 hover:bg-green-700"
                              >
                                Mark Answered
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {post.is_question && (
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <p className="border bg-green-500 text-white rounded px-2 py-1 text-base font-semibold">
                        {post.is_answered ? "Answered" : "Unanswered"}
                      </p>
                      <p className="border bg-red-500 text-white rounded px-2 py-1 text-base font-semibold">
                        Question
                      </p>
                    </div>
                  )}

                  {/* Comments Section */}
                  <CommentSection postId={post.id} />
                </div>
              ))
            ) : (
              <p>No posts available</p>
            )}
          </div>
        </div>
        <div className="w-1/6 p-6">
          {/* Sidebar */}
          <RightSidebar />
        </div>
        {/* Create/Edit Post Modal */}
        <CreateEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPostEdited={handlePostUpdated} // Handle updates in the modal
          currentPostId={currentPostId} // Pass the current post ID
        />
      </div>
    </div>
  );
};

export default CommunityHome;
