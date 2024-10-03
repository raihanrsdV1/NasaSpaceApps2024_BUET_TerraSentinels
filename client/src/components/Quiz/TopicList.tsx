import React, { useState } from "react";

interface Topic {
    id: number;
    name: string;
    description: string;
}

interface TopicListProps {
    topics: Topic[];
    setSelectedTopic: (id: number) => void;
}

const TopicList: React.FC<TopicListProps> = ({ topics, setSelectedTopic }) => {
    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-green-600 mb-6">Select a Topic</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {topics.map((topic) => (
                    <li
                        key={topic.id}
                        className="bg-green-200 hover:bg-green-300 cursor-pointer rounded-lg p-4 shadow-lg transition-all"
                        onClick={() => setSelectedTopic(topic.id)}
                    >
                        <h3 className="font-semibold">{topic.name}</h3>
                        <TopicDescription description={topic.description} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const TopicDescription: React.FC<{ description: string }> = ({ description }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleDescription = () => setIsExpanded(!isExpanded);
    
    // Split the description into words and limit the visible portion
    const words = description.split(" ");
    const visibleWords = isExpanded ? words : words.slice(0, 20);
    
    return (
        <div>
            <p>{visibleWords.join(" ")}</p>
            {words.length > 20 && (
                <button
                    onClick={toggleDescription}
                    className="text-blue-500 underline mt-2"
                >
                    {isExpanded ? "See Less" : "See More"}
                </button>
            )}
        </div>
    );
};

export default TopicList;
