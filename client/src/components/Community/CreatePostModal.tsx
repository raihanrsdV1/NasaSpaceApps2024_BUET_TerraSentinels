import { useState, useEffect } from "react";
import axios from "../../utils/AxiosSetup";
import { Tag } from "../../types/types";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (postData: { title: string; content: string; tags: number[], is_question: boolean }) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [is_question, setIsQuestion] = useState(false);
  const [image, setImage] = useState<File | null>(null);


  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get("/tags/");
        setTags(response.data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, []);

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prevSelected) =>
      prevSelected.includes(tagId)
        ? prevSelected.filter((id) => id !== tagId)
        : [...prevSelected, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    const postData = {
      title,
      content,
      tags: selectedTags,
      is_question,
    };

    onPostCreated(postData);
    onClose();
  };

  return (
    isOpen ? (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
          <h2 className="text-lg font-bold mb-4">Create Post</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1" htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1" htmlFor="content">Content</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Tags</label>
              <div className="flex flex-wrap">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`mr-2 mb-2 px-4 py-1 rounded ${selectedTags.includes(tag.id) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
            {/*
            <div className="mb-4">
              <label className="block mb-1">Images</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </div>
            */}
            <div className="mb-4">
              <label className="block mb-1">Is it a question?</label>
              <input
                type="checkbox"
                checked={is_question}
                onChange={(e) => setIsQuestion(e.target.checked)}
              />
            </div>
            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Create Post
            </button>
            <button type="button" onClick={onClose} className="mt-2 w-full text-center text-gray-500 hover:underline">
              Cancel
            </button>
          </form>
        </div>
      </div>
    ) : null
  );
};

export default CreatePostModal;
