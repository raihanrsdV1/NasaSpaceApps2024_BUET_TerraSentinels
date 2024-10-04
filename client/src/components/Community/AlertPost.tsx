import React, { useState } from 'react';
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import MapSelector from "../MapSelector"; // Ensure correct path for the MapSelector component
import './alertPostStyles.css'; // Custom stylesheet for Alert Post

const apiKey = "AIzaSyAvwlUzN8yS6W6oWei0anmvA_bTuao_ay0";
const mapId = "a76d6833c6f687c8";

const AlertPost: React.FC = () => {
    const [selectedLat, setSelectedLat] = useState<number | null>(null);
    const [selectedLng, setSelectedLng] = useState<number | null>(null);
    const [alertType, setAlertType] = useState<string>("Disease");
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [image, setImage] = useState<File | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Submit logic here
        console.log({ title, content, alertType, selectedLat, selectedLng, image });
    };

    return (
        <div className='flex'>
            <Sidebar />
            <Navbar />
            <div className="alert-container">
                <form className="alert-form" onSubmit={handleSubmit}>
                    <h2 className="alert-form-title">Post an Alert</h2>

                    <div className="button-group">
                        <button
                            type="button"
                            className={`alert-type-btn ${alertType === 'Disease' ? 'active' : ''}`}
                            onClick={() => setAlertType('Disease')}
                        >
                            Disease
                        </button>
                        <button
                            type="button"
                            className={`alert-type-btn ${alertType === 'Pests' ? 'active' : ''}`}
                            onClick={() => setAlertType('Pests')}
                        >
                            Pests
                        </button>
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Upload Image</label>
                        <input type="file" onChange={handleImageUpload} className="form-input" />
                    </div>

                    <div className="map-section">
                        <h3>Select Location</h3>
                        <MapSelector
                            onSelect={(lat, lng) => {
                                setSelectedLat(lat);
                                setSelectedLng(lng);
                            }}
                            apiKey={apiKey}
                            mapId={mapId}
                        />
                        {selectedLat && selectedLng && (
                            <p className="selected-coordinates">
                                Selected Coordinates: Lat: {selectedLat}, Lng: {selectedLng}
                            </p>
                        )}
                    </div>

                    <button type="submit" className="submit-btn">
                        Post Alert
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AlertPost;
