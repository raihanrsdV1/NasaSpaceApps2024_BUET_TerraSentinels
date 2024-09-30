import { useEffect, useState } from "react";
import axios from "../../utils/AxiosSetup";

const CommunityHome = () => {
    const [message, setMessage] = useState<String>("");
    const [posts, setPosts] = useState([]);
    useEffect(() => {
      const fetchData = async () => {
        const response = await axios.get("post/all/");
        setPosts(response.data);
        console.log(response.data);
      };
  
      fetchData();
    }, []);
    return (
      <div>
        <h1>Community Home</h1>
        <div>
          {posts.map((post: any) => {
            return (
              <div key={post.id}>
                <h2>{post.title}</h2>
                <p>{post.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  export default CommunityHome;