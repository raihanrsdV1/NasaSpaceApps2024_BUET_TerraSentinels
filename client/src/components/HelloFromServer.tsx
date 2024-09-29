import { useEffect, useState } from "react";
import axios from "../utils/AxiosSetup";

const HelloFromServer = () => {
  const [message, setMessage] = useState<String>("");
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("hello");
      setMessage(response.data.message);
      console.log(response.data);
    };

    fetchData();
  }, []);
  return (
    <div>
      <p className="text-xl font-bold text-center m-2 p-2">{message}</p>
    </div>
  );
};

export default HelloFromServer;
