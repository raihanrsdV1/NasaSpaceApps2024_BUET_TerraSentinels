import { useContext, useState } from "react";
import CreatePostModal from "./CreatePostModal";
import axios from "../../utils/AxiosSetup"; // Adjust the import path if necessary
import AuthContext from "../../context/AuthContext";

const RightSidebar = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const contextData = useContext(AuthContext);
  const userId = contextData?.user?.user_id;

  const handleCreatePost = () => {
    setModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setModalOpen(false); // Close the modal
  };

  // State arrays for notifications and alerts
  const [notifications, setNotifications] = useState<string[]>([
    "New comment on your post",
    "User123 followed you",
    "Your post was liked",
    "New message from User456",
    "Your post was shared",
    "User789 mentioned you in a comment",
    "User101 replied to your comment",
    "User202 liked your comment",
    "User303 sent you a friend request",
    "User404 sent you a message",
  ]);

  const [alerts, setAlerts] = useState<string[]>([
    "Server downtime scheduled",
    "New version available for update",
    "Security alert: Unusual login activity",
    "New feature: Dark mode now available",
    "New feature: Notifications settings updated",
    "New feature: Profile customization options",
    "New feature: Post sharing feature added",
  ]);

  const handlePostCreated = async (postData: { title: string; content: string; tags: number[], is_question: boolean }) => {
    try {
        // Call the API to create a post
        const updatedPostData = {...postData, user: userId};
        const response = await axios.post("/post/", updatedPostData);
        console.log("Post created:", response.data);
        // Optionally, you can update the state or trigger a refresh of the post list here
    } catch (error) {
        console.error("Error creating post:", error);
        // Optionally, handle error (e.g., show a notification to the user)
    } finally {
        handleCloseModal(); // Close the modal after the post is created
        window.location.reload(); // Reload the page to show the new post
    }
  };

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={handleCreatePost}
        className="mb-4 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Create Post
      </button>

      <button
        className="mb-4 py-2 px-4 bg-purple-600 text-white rounded hover:bg-blue-700"
      >
        Create Alert
      </button>

      <button
        className="mb-4 py-2 px-4 bg-orange-600 text-white rounded hover:bg-blue-700"
      >
        Export Alerts
      </button>

      {/* Notifications Section */}
      <div className="mb-4 flex flex-col w-full">
        <h2 className="font-bold text-lg text-center mb-2">Notifications</h2>
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '180px' }}>
          {notifications.length === 0 ? (
            <p>No new notifications.</p>
          ) : (
            notifications.map((notification, index) => (
              <div key={index} className="border-b border-gray-300 py-2">
                {notification}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alerts Section */}
      <div className="flex flex-col w-full">
        <h2 className="font-bold text-lg text-center mb-2">Alerts</h2>
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '180px' }}>
          {alerts.length === 0 ? (
            <p>No alerts at the moment.</p>
          ) : (
            alerts.map((alert, index) => (
              <div key={index} className="border-b border-gray-300 py-2">
                {alert}
              </div>
            ))
          )}
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPostCreated={handlePostCreated}
      />
      {/* You can add more items here later */}
    </div>
  );
};

export default RightSidebar;
