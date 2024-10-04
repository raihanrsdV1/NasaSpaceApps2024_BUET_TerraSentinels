import React from 'react';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import './expertcss.css'; // Make sure to create and link a stylesheet
import profilepic from './profile.png'; // Import a profile image

const ExpertList: React.FC = () => {
  const experts = [
    {
      name: 'Mohammad Zahirul Islam K',
      contactNo: '+1234567890',
      region: 'Rajshahi, Bangladesh',
      tags: ['Soil Health', 'Water Management', 'Crop Rotation'],
      social: '@zahir_islam',
    },
    {
      name: 'Shah Mohammad Abdul Mannan',
      contactNo: '+9876543210',
      region: 'Chattogram, Bangladesh',
      tags: ['Pest Control', 'Greenhouse Farming', 'Organic Agriculture'],
      social: '@manna_shah',
    },
    {
      name: 'Mehedi Khan',
      contactNo: '+1928374650',
      region: 'Florida, USA',
      tags: ['Irrigation Systems', 'Sustainable Farming', 'Agri-Tech'],
      social: '@mkhan',
    },
    // Add more dummy experts as needed
  ];

  return (
    <div className="flex">
      <Sidebar />
      <Navbar />
      <div className="expert-page-container">
        <h1 className="experts-heading">Experts</h1> {/* Heading added */}
        <div className="expert-list">
          {experts.map((expert, index) => (
            <div className="expert-card" key={index}>
              <img
                src={profilepic} // Add a profile image
                alt="Profile"
                className="expert-profile-pic"
              />
              <div className="expert-info">
                <h2>{expert.name}</h2>
                <p><strong>Contact:</strong> {expert.contactNo}</p>
                <p><strong>Region:</strong> {expert.region}</p>
                <p><strong>Social:</strong> {expert.social}</p>
                <div className="tags-container">
                  {expert.tags.map((tag, i) => (
                    <span className="tag-pill" key={i}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpertList;
