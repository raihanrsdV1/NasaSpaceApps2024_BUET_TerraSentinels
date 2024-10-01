import React, { Fragment, useState, useEffect, useRef } from 'react';
import HelloFromServer from "./components/HelloFromServer";
import WeatherData2DGraph from "./components/WeatherData2dGraph";
import CommunityHome from './components/Community/CommunityHome';
import CommunityRegister from './components/Community/CommunityRegister';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';



const App: React.FC = () => {
  return (
    <Fragment>
      <ToastContainer />

      <Router>
        <Routes>
          <Route path="/" element={<HelloFromServer />} />
          <Route path="/data" element={<WeatherData2DGraph
            latitude={37.7749}
            longitude={-122.4194}
            startDate="20210101"
            endDate="20210131"
            parameter="PRECTOTCORR"
            label="Surface Temperature"
          />} />
          <Route path="/community" element={<CommunityHome />} />
          <Route path="/register" element={<CommunityRegister />} />
        </Routes>
        
      </Router>
      

    </Fragment>
  );
};

export default App;
