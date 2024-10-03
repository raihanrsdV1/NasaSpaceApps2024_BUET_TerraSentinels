import React from 'react';
import Weather from './Weather';
// import CropProduction from './CropProduction';
import Alerts from './Alerts';
import './stylesheet.css'
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import TaskManager from './TaskManager';

const DBoard = () => {
    return (
        <div className='flex'>
            <Sidebar />
            <Navbar />
            <div className="dashboard">
                <div className="main-content">
                    <div className="top-row">
                        <Weather />
                        <TaskManager />
                        <Alerts />
                    </div>
                    <div className="middle-row"></div>
                    <div className="bottom-row">
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DBoard;
