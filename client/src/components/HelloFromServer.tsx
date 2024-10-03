import { useEffect, useState, useContext } from "react";
import useAxios from "../hooks/useAxios";
import AuthContext from "../context/AuthContext";

const HelloFromServer = () => {
  const axios = useAxios();
  const [message, setMessage] = useState<String>("");

  const contextData = useContext(AuthContext);
  const user = contextData?.user;
  console.log(user);

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
