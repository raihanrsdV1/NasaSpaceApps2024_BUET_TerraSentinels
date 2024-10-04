import React, { Fragment, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import HelloFromServer from "./components/HelloFromServer";
import DataAnalysis from "./components/Data/DataAnalysis";

//import CommunityHome from './components/Community/CommunityHome';
// import CommunityRegister from './components/Community/CommunityRegister';
// import CommunityLogin from './components/Community/CommunityLogin';
// import QuizPage from './components/Quiz/QuizPage';
// import WaterData from './components/water_resources/WaterData';
import Weather from './components/Dashboard/Weather';
import Dashboard from './components/Dashboard/DBoard';
import CommunityHome from "./components/Community/CommunityHome";
import Login from "./components/Community/Login";
import Register from "./components/Community/Register";
import QuizPage from "./components/Quiz/QuizPage";
import WaterData from "./components/water_resources/WaterData";
import { AuthProvider } from "./context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import DroughtPrediction from "./components/Extremities/DroughtPrediction";

const App: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    toast.dismiss();
  }, [pathname]);
  return (
    <div>
      <div>
          <Routes>
            <Route path="/" element={<HelloFromServer />} />
            <Route path="/data" element={<DataAnalysis />} />
            <Route path="/community" element={<CommunityHome />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/water_resources" element={<WaterData />} />
            <Route path="/extremities" element={<DroughtPrediction />} />
          </Routes>
      </div>

      <ToastContainer />
{/* 
      <Router>
        <Routes>
          <Route path="/" element={<HelloFromServer />} />
          <Route path="/data" element={<DataAnalysis />} />
          <Route path="/community" element={<CommunityHome />} />
          {/* <Route path="/register" element={<CommunityRegister />} />
          <Route path="/login" element={<CommunityLogin />} /> */}
          {/* <Route path="/quiz" element={<QuizPage />} />
          <Route path="/water_resources" element={<WaterData />} />
          <Route path="/dashboard" element ={<Dashboard />} />  
          <Route path="/extremities" element={<DroughtPrediction />} />
    //     </Routes>
    //   </Router>
    // </Fragment */} /**/

    // </div>

  );
};

export default App;
