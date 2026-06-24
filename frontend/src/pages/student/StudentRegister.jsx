import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getServerFieldErrors, validateStudentRegistration } from '../../utils/authValidation';

const StudentRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '', usn: '', email: '', phone: '', password: '', branch: '', semester: '', section: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((current) => ({ ...current, [e.target.name]: '', form: '' }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validateStudentRegistration(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;
    
    try {
      const response = await axios.post('http://localhost:5000/register', formData);
      if (response.data.message === "Student Registered Successfully") {
        navigate('/student/login');
      }
    } catch (err) {
      setErrors(getServerFieldErrors(err));
    }
  };

  return (
    <div className="auth-container" style={{ padding: '40px 20px' }}>
      <div className="glass-panel auth-card animate-fade-in" style={{ maxWidth: '800px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Student Registration</h2>
        
        {errors.form && <div className="form-error">{errors.form}</div>}
        
        <form onSubmit={handleRegister} noValidate>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="full_name" className="form-control" onChange={handleChange} required />
              {errors.full_name && <div className="field-error">{errors.full_name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">USN</label>
              <input type="text" name="usn" className="form-control" onChange={handleChange} required />
              {errors.usn && <div className="field-error">{errors.usn}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Email (VVCE Only)</label>
              <input type="email" name="email" className="form-control" onChange={handleChange} required />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="text" name="phone" className="form-control" onChange={handleChange} />
              {errors.phone && <div className="field-error">{errors.phone}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Branch</label>
              <select name="branch" className="form-control" onChange={handleChange} required defaultValue="">
                <option value="" disabled>Select Branch</option>
                <option value="CSE">CSE</option>
                <option value="ISE">ISE</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>
              {errors.branch && <div className="field-error">{errors.branch}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <select name="semester" className="form-control" onChange={handleChange} required defaultValue="">
                <option value="" disabled>Select Semester</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
              </select>
              {errors.semester && <div className="field-error">{errors.semester}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Section</label>
              <input type="text" name="section" className="form-control" onChange={handleChange} required />
              {errors.section && <div className="field-error">{errors.section}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-control" onChange={handleChange} required />
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Register Now
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>
          Already have an account? <Link to="/student/login" style={{ color: 'var(--accent-purple)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default StudentRegister;
