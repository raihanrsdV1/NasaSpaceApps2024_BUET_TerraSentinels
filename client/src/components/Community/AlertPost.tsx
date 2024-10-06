import React, { useState, useEffect, useContext } from 'react';
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import MapSelector from "../MapSelector"; 
import './alertPostStyles.css'; 
import axios from "../../utils/AxiosSetup";
import AuthContext from "../../context/AuthContext";
import {toast} from 'react-toastify';

const apiKey = "AIzaSyAvwlUzN8yS6W6oWei0anmvA_bTuao_ay0";
const mapId = "a76d6833c6f687c8";

// Pre-defined fixed diseases and symptoms mapping
const fixedDiseases: { [key: string]: string[] } = {
    Blight: ['Yellowing Leaves', 'Wilting', 'Fungal Spots'],
    Rust: ['Orange Pustules', 'Leaf Curling', 'Stem Lesions'],
    'Mosaic Virus': ['Leaf Mottling', 'Growth Stunting', 'Fruit Deformation'],
    Wilt: ['Drooping Leaves', 'Stunted Growth', 'Browning'],
    'Powdery Mildew': ['White Powder on Leaves', 'Leaf Curling', 'Stem Weakening'],
    'Root Rot': ['Yellowing', 'Rotting Roots', 'Wilting'],
    Anthracnose: ['Dark Spots on Fruit', 'Leaf Drop', 'Twigs Dieback'],
    Scab: ['Raised Lesions', 'Fruit Cracking', 'Leaf Blight'],
    'Leaf Spot': ['Brown Spots', 'Yellowing', 'Premature Leaf Drop'],
    'Downy Mildew': ['Fuzzy Growth on Underside', 'Leaf Discoloration', 'Stunted Growth'],
};
const AlertPost: React.FC = () => {
    const [selectedLat, setSelectedLat] = useState<number | null>(null);
    const [selectedLng, setSelectedLng] = useState<number | null>(null);
    const [alertType, setAlertType] = useState<string>("Disease");
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const contextData = useContext(AuthContext);
    const userId = contextData?.user?.user_id;
    
    const [diseases, setDiseases] = useState<string[]>([]);
    const [pests, setPests] = useState<any[]>([]);
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]); // New state for symptoms

    useEffect(() => {
        const fetchDiseases = async () => {
            try {
                const response = await axios.get('/diseases/unique/');
                setDiseases(response.data.unique_diseases || []);
            } catch (error) {
                console.error('Error fetching diseases:', error);
            }
        };

        const fetchPests = async () => {
            try {
                const response = await axios.get('/pests/');
                setPests(response.data || []);
            } catch (error) {
                console.error('Error fetching pests:', error);
            }
        };

        fetchDiseases();
        fetchPests();
    }, []);

    const handleDiseaseChange = (disease: string) => {
        setSelectedReason(disease);
        // Automatically select symptoms based on the disease selected
        setSelectedSymptoms(fixedDiseases[disease] || []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const postResponse = await axios.post('/post/', {
                title,
                content,
                tags: [],
                user: userId,
            });
            console.log('Post created successfully:', postResponse.data.post.id);
            const postId = postResponse.data.post.id;
            console.log('Post created successfully:', postId);

            // Send selected symptoms along with the alert
            await axios.post('/alert/', {
                post: postId,
                alert_type: alertType,
                alert_reason: selectedReason,
                alert_location_lat: selectedLat,
                alert_location_lon: selectedLng,
                alert_region: "Selected region", // Modify to get the actual region if available
                symptoms: selectedSymptoms // Add the symptoms here

            });

            // Show success notification
            toast.success("Alert created successfully!");

        // Reset states
            setTitle('');
            setContent('');
            setSelectedLat(null);
            setSelectedLng(null);
            setSelectedReason('');
            setAlertType('Disease'); // or any default type
            setSelectedSymptoms([]);

            console.log('Alert created successfully!');
        } catch (error) {
            toast.error("Error creating alert. Please try again later.");
            if (axios.isAxiosError(error)) {
                console.error('Error creating alert:', error.message);
                console.error('Response data:', error.response?.data);
                console.error('Response status:', error.response?.status);
                console.error('Response headers:', error.response?.headers);


            } else {
                console.error('Unexpected error:', error);
            }
        }
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

                    {alertType === 'Disease' && (
                        <div className="form-group">
                            <label htmlFor="disease">Select Disease</label>
                            <select
                                id="disease"
                                value={selectedReason}
                                onChange={(e) => handleDiseaseChange(e.target.value)} // Update to use the new handler
                                className="form-input"
                                required
                            >
                                <option value="" disabled>Select a disease</option>
                                {diseases && Array.isArray(diseases) && diseases.length > 0 ? (
                                    diseases.map((disease, index) => (
                                        <option key={index} value={disease}>
                                            {disease}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>Loading diseases...</option>
                                )}
                            </select>
                        </div>
                    )}

                    {alertType === 'Pests' && (
                        <div className="form-group">
                            <label htmlFor="pest">Select Pest</label>
                            <select
                                id="pest"
                                value={selectedReason}
                                onChange={(e) => setSelectedReason(e.target.value)}
                                className="form-input"
                                required
                            >
                                <option value="" disabled>Select a pest</option>
                                {pests && Array.isArray(pests) && pests.length > 0 ? (
                                    pests.map((pest, index) => (
                                        <option key={index} value={pest.name}>
                                            {pest.name} ({pest.typical_region})
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>Loading pests...</option>
                                )}
                            </select>
                        </div>
                    )}

                    {alertType === 'Disease' && selectedSymptoms.length > 0 && (
                        <div className="form-group">
                            <label>Symptoms</label>
                            <ul>
                                {selectedSymptoms.map((symptom, index) => (
                                    <li key={index}>{symptom}</li>
                                ))}
                            </ul>
                        </div>
                    )}

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
