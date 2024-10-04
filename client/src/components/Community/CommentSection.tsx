import { useEffect, useState, useRef, useContext } from "react";
import axios from "../../utils/AxiosSetup";
import { Comment } from "../../types/types";
import AuthContext from "../../context/AuthContext";

interface CommentSectionProps {
  postId: number;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState(""); // Add this line
  const [editTo, setEditTo] = useState<number | null>(null); // Add this line
  const [editContent, setEditContent] = useState(""); // Add this line
  const contextData = useContext(AuthContext);
  const userId = contextData?.user?.user_id;

  const replyRef = useRef<HTMLDivElement | null>(null);
  const editRef = useRef<HTMLDivElement | null>(null);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/comments/${postId}/`);
      const processedComments = response.data.map((comment: Comment) => {
        let upvotes = 0;
        let downvotes = 0;
        let userVote: "upvoted" | "downvoted" | null = null;

        comment.ratings.forEach((rating) => {
          if (rating.value === 1) upvotes++;
          if (rating.value === -1) downvotes++;
          if (rating.user === userId) {
            userVote = rating.value === 1 ? "upvoted" : "downvoted";
          }
        });

        return { ...comment, upvotes, downvotes, userVote };
      });
      setComments(processedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleReplySubmit = async (commentId: number) => { // Add this function
    try {
        const response = await axios.post("/comment/", {
            post: postId,
            user: userId,
            content: replyContent,
            parent_comment: commentId,
        });

        const newCommentData = {
            ...response.data,
            upvotes: 0,
            downvotes: 0,
            userVote: null,
        };

        setComments([...comments, newCommentData]);
        setReplyContent("");
        setReplyTo(null); // Clear reply after posting

        fetchComments(); // Fetch comments again to update the list
    } catch (error) {
        console.error("Error adding reply:", error);
    }
};

  const handleAddComment = async () => {
    try {
      const response = await axios.post("/comment/", {
        post: postId,
        user: userId,
        content: newComment,
        parent_comment: replyTo,
      });
  
      const newCommentData = {
        ...response.data,
        upvotes: 0,
        downvotes: 0,
        userVote: null,
      };
  
      setComments([...comments, newCommentData]); // Add new comment directly to the comments array
      setNewComment("");
      setReplyTo(null); // Clear reply after posting

      fetchComments(); // Fetch comments again to update the list
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  

  const handleReply = (commentId: number) => {
    setReplyTo(commentId);
    setEditTo(null); // Hide edit text area when replying
  };

  const handleDelete = async (commentId: number) => {
    try {
        await axios.delete(`/comment/delete/${commentId}/`); // API call to delete the comment
        setComments((prevComments) => prevComments.filter((c) => c.id !== commentId)); // Update state
    } catch (error) {
        console.error("Error deleting comment:", error);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditTo(comment.id); // Set the comment ID to edit
    setReplyTo(null); // Hide reply text area when editing
    setEditContent(comment.content); // Set current content for editing
  };

  const handleEditSubmit = async (commentId: number) => {
    try {
        const response = await axios.put(`/comment/edit/${commentId}/`, {
          post: postId,
          user: userId,
          content: editContent,
        });

        // Update the comments state with the edited comment
        setComments((prevComments) =>
            prevComments.map((c) =>
                c.id === commentId ? { ...c, content: response.data.content } : c
            )
        );

        setReplyContent(""); // Clear the textarea
        setReplyTo(null); // Clear replyTo after editing
        setEditTo(null); // Clear editTo after editing
        setEditContent(""); // Clear edit content after editing

        fetchComments(); // Fetch comments again to update the list
    } catch (error) {
        console.error("Error editing comment:", error);
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (replyRef.current && !replyRef.current.contains(event.target as Node)) {
        setReplyTo(null); // Hide reply text area
        setReplyContent(""); // Clear reply content
    }
    if (editRef.current && !editRef.current.contains(event.target as Node)) {
        setEditTo(null); // Hide edit text area
        setEditContent(""); // Clear edit content
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);


  // Render comments recursively
  const renderComments = (comments: Comment[], parentId: number | null = null) => {
    return comments
      .filter((comment) => comment.parent_comment === parentId)
      .map((comment) => (
        <div key={comment.id} className="mb-4 p-2 border-l border-gray-400 pl-4">
          <p className="text-sm text-gray-500">
            {new Date(comment.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            {new Date(comment.created_at).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p>{comment.content}</p>

          {/* Upvote and Downvote Buttons */}
          <div className="flex items-center">
            <button onClick={() => handleUpvote(comment.id)} className="flex items-center">
              <span className={`${comment.userVote === "upvoted" ? "text-blue-500" : "text-gray-500"}`}>▲</span>
            </button>
            <span className="mx-2">{comment.upvotes - comment.downvotes}</span>
            <button onClick={() => handleDownvote(comment.id)} className="flex items-center">
              <span className={`${comment.userVote === "downvoted" ? "text-red-500" : "text-gray-500"}`}>▼</span>
            </button>
          </div>

          <button
            onClick={() => handleReply(comment.id)}
            className="bg-black text-white text-sm mt-2 mx-1 rounded-lg border border-black px-1 py-1"
          >
            Reply
          </button>

          {/* Add Edit Button */}
          {comment.user === userId && ( // Check if the user owns the comment
            <>
                <button onClick={() => handleEdit(comment)} className="bg-black text-white text-sm mt-2 mx-1 rounded-lg border border-black px-1 py-1">
                    Edit
                </button>
                <button onClick={() => handleDelete(comment.id)} className="bg-black text-white text-sm mt-2 mx-1 rounded-lg border border-black px-1 py-1">
                    Delete
                </button>
            </>
          )}

          {/* Render nested comments */}
          {renderComments(comments, comment.id)}

          {replyTo === comment.id && ( // Add this condition
          <div ref={replyRef} className="mt-2">
              <textarea
                  className="w-full p-2 border rounded"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
              ></textarea>
              <button
                  className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
                  onClick={() => handleReplySubmit(comment.id)} // Update to use handleReplySubmit
              >
                  Reply
              </button>
          </div>
          )}

          {editTo === comment.id && ( // Add this condition
            <div ref={editRef} className="mt-2">
                <textarea
                    className="w-full p-2 border rounded"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Edit your comment..."
                ></textarea>
                <button
                    className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
                    onClick={() => handleEditSubmit(comment.id)} // Update to use handleEditSubmit
                >
                    Edit
                </button>
            </div>
          )}
        </div>
      ));
  };

  const handleUpvote = async (commentId: number) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    try {
      if (comment.userVote === "upvoted") {
        await axios.delete("/comment_ratings/undo/", { data: { comment_id: commentId, user: userId } });
        setComments((prevComments) =>
          prevComments.map((c) => (c.id === commentId ? { ...c, upvotes: c.upvotes - 1, userVote: null } : c))
        );
      } else {
        await axios.post("/comment_ratings/add/", { comment_id: commentId, user: userId, value: 1 });
        setComments((prevComments) =>
          prevComments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  upvotes: c.upvotes + 1,
                  downvotes: comment.userVote === "downvoted" ? c.downvotes - 1 : c.downvotes,
                  userVote: "upvoted",
                }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Error upvoting comment:", error);
    }
  };

  const handleDownvote = async (commentId: number) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    try {
      if (comment.userVote === "downvoted") {
        await axios.delete("/comment_ratings/undo/", { data: { comment_id: commentId, user: userId } });
        setComments((prevComments) =>
          prevComments.map((c) => (c.id === commentId ? { ...c, downvotes: c.downvotes - 1, userVote: null } : c))
        );
      } else {
        await axios.post("/comment_ratings/add/", { comment_id: commentId, user: userId, value: -1 });
        setComments((prevComments) =>
          prevComments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  downvotes: c.downvotes + 1,
                  upvotes: comment.userVote === "upvoted" ? c.upvotes - 1 : c.upvotes,
                  userVote: "downvoted",
                }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Error downvoting comment:", error);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2">Comments</h3>

      {/* Render existing comments */}
      <div>{renderComments(comments)}</div>

      {/* Add new comment or reply */}
      <div className="mt-4">
        <textarea
          className="w-full p-2 border rounded"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
        ></textarea>
        <button
          className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
          onClick={handleAddComment}
        >
          {replyTo ? "Reply" : "Add Comment"}
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
