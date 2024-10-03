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
            <div className="dashboard mt-20">
                <div className="main-content">
                    <div className="top-row full-width"> {/* Added full-width class */}
                        <Weather />
                    </div>
                    <TaskManager />
                    <Alerts />
                    <div className="middle-row"></div>
                    <div className="bottom-row"></div>
                </div>
            </div>
        </div>
    );
};

export default DBoard;

