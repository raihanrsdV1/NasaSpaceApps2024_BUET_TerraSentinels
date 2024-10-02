import React, { Fragment } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HelloFromServer from "./components/HelloFromServer";
import DataAnalysis from "./components/Data/DataAnalysis";
import CommunityHome from './components/Community/CommunityHome';
import CommunityRegister from './components/Community/CommunityRegister';
import CommunityLogin from './components/Community/CommunityLogin';
import WaterData from './components/water_resources/WaterData';

const App: React.FC = () => {
  return (
    <Fragment>
      <ToastContainer />
      <Router>
        <Routes>
          <Route path="/" element={<HelloFromServer />} />
          <Route path="/data" element={<DataAnalysis />} />
          <Route path="/community" element={<CommunityHome />} />
          <Route path="/register" element={<CommunityRegister />} />
          <Route path="/login" element={<CommunityLogin />} />
          <Route path="/water_resources" element={<WaterData />} />
        </Routes>
      </Router>
    </Fragment>
  );
};

export default App;