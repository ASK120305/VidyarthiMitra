import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import logo from './logo.png';

function App() {
  const [formData, setFormData] = useState({
    courseName: '',
    studentName: '',
    city: '',
    searchQuery: '',
    educationLevel: '',
    specialization: ''
  });

  const [specializations, setSpecializations] = useState([]);
  const [cities, setCities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const collegesPerPage = 7;

  useEffect(() => {
    const fetchSpecializations = async () => {
      if (formData.courseName) {
        try {
          const res = await axios.get(`http://localhost:5000/api/students/specializations?stream=${formData.courseName}`);
          setSpecializations(res.data.data.map(item => item.course));
          console.log('Selected Stream:', formData.courseName);
          console.log('Fetched specializations:', res.data.data);
        } catch (error) {
          console.error('Error fetching specializations:', error);
          setSpecializations([]);
        }
      } else {
        setSpecializations([]);
      }
    };

    fetchSpecializations();
  }, [formData.courseName]);

  useEffect(() => {
    if (formData.specialization) {
      console.log('Selected Specialization:', formData.specialization);
    }
  }, [formData.specialization]);

  // Modified useEffect for cities - only fetch for Undergraduate
  useEffect(() => {
    const fetchCities = async () => {
      // Only fetch cities for Undergraduate courses
      if (formData.courseName && formData.educationLevel === 'Undergraduate') {
        try {
          const res = await axios.get(`http://localhost:5000/api/students/cities?stream=${formData.courseName}`);
          setCities(res.data.data.map(item => item.city));
          console.log('Fetched cities:', res.data.data);
        } catch (error) {
          console.error('Error fetching cities:', error);
          setCities([]);
        }
      } else {
        setCities([]);
      }
    };

    fetchCities();
  }, [formData.courseName, formData.educationLevel]);

  // Modified useEffect for colleges - conditional city parameter
  useEffect(() => {
    const fetchColleges = async () => {
      if (formData.courseName && formData.specialization) {
        // For Undergraduate: require city selection
        // For Postgraduate: don't require city
        if (formData.educationLevel === 'Undergraduate' && !formData.city) {
          setColleges([]);
          return;
        }

        try {
          let url = `http://localhost:5000/api/students/colleges?stream=${formData.courseName}&specialization=${formData.specialization}`;
          
          // Only add city parameter for Undergraduate
          if (formData.educationLevel === 'Undergraduate' && formData.city) {
            url += `&city=${formData.city}`;
          }

          const res = await axios.get(url);
          setColleges(res.data.data);
          console.log('Fetched colleges:', res.data.data);
        } catch (error) {
          console.error('Error fetching colleges:', error);
          setColleges([]);
        }
      } else {
        setColleges([]);
      }
    };

    fetchColleges();
  }, [formData.courseName, formData.specialization, formData.city, formData.educationLevel]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'educationLevel') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        courseName: '',
        specialization: '',
        city: '' // Clear city when education level changes
      }));
      setColleges([]);
    }
    else if (name === 'courseName') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        specialization: '',
        city: '' // Clear city when stream changes
      }));
      setColleges([]);
    }
    else if (name === 'specialization') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      setColleges([]);
      console.log('Selected Specialization:', value);
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    // Modified validation - city only required for Undergraduate
    const isCityRequired = formData.educationLevel === 'Undergraduate';
    
    if (!formData.educationLevel || !formData.courseName || !formData.specialization || !formData.studentName) {
      alert('Please fill all required fields');
      return;
    }

    if (isCityRequired && !formData.city) {
      alert('Please select a city');
      return;
    }

    try {
      let url = `http://localhost:5000/api/students/colleges?stream=${formData.courseName}&specialization=${formData.specialization}`;
      
      // Only add city parameter for Undergraduate
      if (formData.educationLevel === 'Undergraduate' && formData.city) {
        url += `&city=${formData.city}`;
      }

      const res = await axios.get(url);
      setColleges(res.data.data);
      setShowResults(true);
      setCurrentPage(1);
      console.log('Fetched colleges on submit:', res.data.data);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      alert('Error fetching colleges. Please try again.');
    }
  };

  // Pagination logic
  const indexOfLastCollege = currentPage * collegesPerPage;
  const indexOfFirstCollege = indexOfLastCollege - collegesPerPage;
  const currentColleges = colleges.slice(indexOfFirstCollege, indexOfLastCollege);
  const totalPages = Math.ceil(colleges.length / collegesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="header__content">
            <img src={logo} alt="VidyarthiMitra Logo" className="header__logo" />
            <div>
              <h1 className="header__title">VidyarthiMitra Non-Cet College</h1>
              <div className="header__subtitle">Empowering Your College Search</div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="search-bar">

          </div>

          <div className="education-level-group">
            <label className="label">Select Education Level:</label>
            <div className="education-level-options">
              <label>
                <input
                  type="radio"
                  name="educationLevel"
                  value="Undergraduate"
                  checked={formData.educationLevel === 'Undergraduate'}
                  onChange={handleInputChange}
                />
                Undergraduate
              </label>
              <label>
                <input
                  type="radio"
                  name="educationLevel"
                  value="Postgraduate"
                  checked={formData.educationLevel === 'Postgraduate'}
                  onChange={handleInputChange}
                />
                Postgraduate
              </label>
            </div>
          </div>
   
          <div className="course-selection">
            <label className="label">
              Select Stream:
            </label>
            <select 
              name="courseName"
              value={formData.courseName}
              onChange={handleInputChange}
              className="select-dropdown course-select"
              disabled={!formData.educationLevel}
            >
              <option value="">Select Stream</option>
              {formData.educationLevel === 'Undergraduate' && (
                <>
                  <option value="Sports Management">Bachelors in Sports Management</option>
                  <option value="Fine Arts">Bachelors in Fine Arts</option>
                  <option value="Performing Arts">Bachelors in Performing Arts</option>
                  <option value="Management">Bachelors in Management Studies</option>
                  <option value="Science">Bachelors in Science</option>
                  <option value="Commerce">Bachelors in Commerce</option>
                  <option value="Arts">Bachelors in Arts</option>
                  <option value="Vocational">Bachelors in Vocational</option>
                  <option value="International Accounting">Bachelors in International Accounting</option>
                </>
              )}
              {formData.educationLevel === 'Postgraduate' && (
                <>
                  <option value="Master of Science">Master of Science</option>
                  <option value="Master of Arts">Master of Arts</option>
                  <option value="Master of Commerce">Master of Commerce</option>
                  <option value="MA Psychology">MA Psychology</option>
                </>
              )}
            </select>
          </div>

         {/* Specialization Dropdown */}
<div className="specialization-group">
  <label className="label">Select Specialization:</label>
  <select
    name="specialization"
    value={formData.specialization}
    onChange={handleInputChange}
    className="select-dropdown"
  >
    <option value="">Select Specialization</option>
    {specializations.map((spec, index) => (
      <option key={index} value={spec}>{spec}</option>
    ))}
  </select>
</div>

          {/* Filter Colleges Section */}
          <div className="filter-section">
            <h2 className="section-title">Filter Colleges</h2>
            
            {/* Student Name */}
            <div className="form-group">
              <label className="label">
                Student Name:
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="text-input"
              />
            </div>

            {/* City Selection - Only show for Undergraduate */}
            {formData.educationLevel === 'Undergraduate' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="label">
                    City:
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="select-dropdown"
                    disabled={!formData.courseName}
                  >
                    <option value="">Select City</option>
                    <option value="All">All</option>
                    {cities.map((city, index) => (
                      <option key={index} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="submit-section">
            <button
              onClick={handleSubmit}
              className="submit-btn"
              disabled={showResults}
            >
              {showResults ? 'Results Displayed' : 'Submit'}
            </button>
          </div>

          {/* Results Table */}
          {showResults && colleges.length > 0 && (
            <div className="results-section">
              <h2 className="section-title">Available Colleges ({colleges.length} found)</h2>
              <table className="colleges-table">
                <thead>
                  <tr>
                    {colleges[0]?.college_code && <th>College Code</th>}
                    <th>College Name</th>
                    {colleges[0]?.city && <th>City</th>}
                    <th>Course</th>
                  </tr>
                </thead>
                <tbody>
                  {currentColleges.map((college, index) => (
                    <tr key={index}>
                      {college.college_code && <td>{college.college_code}</td>}
                      <td>{college.institute_name}</td>
                      {college.city && <td>{college.city}</td>}
                      <td>{college.course}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {showResults && colleges.length > 0 && (
            <div className="pagination">
              <button 
                className="pagination-btn" 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="page-info">Page {currentPage} of {totalPages}</span>
              <button 
                className="pagination-btn" 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div> 
      </div> 
      <footer className="footer">
        <div className="footer__content">
          <div className="footer__section">
            <div className="footer__label">Connect with us</div>
            <div className="footer__social">
              <a href="https://www.linkedin.com/company/vidyarthimitra/" target="_blank" rel="noopener noreferrer" className="footer__icon" aria-label="LinkedIn">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.599v5.597z"/></svg>
              </a>
              <a href="https://www.instagram.com/vidyarthi_mitra/" target="_blank" rel="noopener noreferrer" className="footer__icon" aria-label="Instagram">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.012-4.947.07-1.276.058-2.687.334-3.678 1.325-.991.991-1.267 2.402-1.325 3.678-.058 1.28-.07 1.688-.07 4.947s.012 3.667.07 4.947c.058 1.276.334 2.687 1.325 3.678.991.991 2.402 1.267 3.678 1.325 1.28.058 1.688.07 4.947.07s3.667-.012 4.947-.07c1.276-.058 2.687-.334 3.678-1.325.991-.991 1.267-2.402 1.325-3.678.058-1.28.07-1.688.07-4.947s-.012-3.667-.07-4.947c-.058-1.276-.334-2.687-1.325-3.678-.991-.991-2.402-1.267-3.678-1.325-1.28-.058-1.688-.07-4.947-.07zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
              <a href="https://twitter.com/vidyarthimitra" target="_blank" rel="noopener noreferrer" className="footer__icon" aria-label="X (Twitter)">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M22.162 0h-4.327l-5.835 8.228-5.835-8.228h-4.327l8.228 11.627-8.228 11.627h4.327l5.835-8.228 5.835 8.228h4.327l-8.228-11.627z"/></svg>
              </a>
              <a href="https://www.vidyarthimitra.org/" target="_blank" rel="noopener noreferrer" className="footer__icon" aria-label="Official Website">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8 0-1.306.314-2.537.877-3.617L8.293 17.12A7.963 7.963 0 0 0 12 20zm6.123-3.617L15.707 6.88A7.963 7.963 0 0 0 12 4c4.411 0 8 3.589 8 8 0 1.306-.314 2.537-.877 3.617zM12 6a6 6 0 1 1 0 12A6 6 0 0 1 12 6z"/></svg>
              </a>
            </div>
          </div>
          <div className="footer__section">
            <div className="footer__label">Official Website</div>
            <a href="https://www.vidyarthimitra.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#5b8def', fontWeight: 600, textDecoration: 'none', fontSize: '1.08rem' }}>www.vidyarthimitra.org</a>
          </div>
          <div className="footer__section">
            <div className="footer__label" style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}>
              CONTACT <span style={{color: '#f47c20'}}>US</span>
            </div>
            <div className="footer__divider" style={{height: '1px', background: 'rgba(255,255,255,0.18)', width: '100%', margin: '0.3rem 0 0.7rem 0'}}></div>
            <div className="footer__contact-item"><span style={{display:'inline-flex',alignItems:'center',gap:'0.5rem'}}><svg width="18" height="18" fill="#bfc9d8" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.2 2.2z"/></svg>+91 77200 25900</span></div>
            <div className="footer__contact-item"><span style={{display:'inline-flex',alignItems:'center',gap:'0.5rem'}}><svg width="18" height="18" fill="#bfc9d8" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.2 2.2z"/></svg>+91 77200 81400</span></div>
            <div className="footer__contact-item"><span style={{display:'inline-flex',alignItems:'center',gap:'0.5rem'}}><svg width="18" height="18" fill="#bfc9d8" viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 20v-9.99l8 6.99 8-6.99V20H4z"/></svg>contact@vidyarthimitra.org</span></div>
            <div className="footer__contact-item"><span style={{display:'inline-flex',alignItems:'center',gap:'0.5rem'}}><svg width="18" height="18" fill="#bfc9d8" viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 20v-9.99l8 6.99 8-6.99V20H4z"/></svg>info@vidyarthimitra.org</span></div>
          </div>
          <div className="footer__section footer__copyright">
            © {new Date().getFullYear()} VidyarthiMitra. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;