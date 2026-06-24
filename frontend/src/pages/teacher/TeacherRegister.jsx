import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getServerFieldErrors, validateTeacherRegistration } from '../../utils/authValidation';

const TeacherRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '', email: '', password: '', branch: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((current) => ({ ...current, [e.target.name]: '', form: '' }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validateTeacherRegistration(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;
    
    try {
      const response = await axios.post('http://localhost:5000/teacher/register', formData);
      if (response.data.message === "Teacher Registered Successfully") {
        navigate('/teacher/login');
      }
    } catch (err) {
      setErrors(getServerFieldErrors(err));
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card animate-fade-in">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Teacher Registration</h2>
        
        {errors.form && <div className="form-error">{errors.form}</div>}
        
        <form onSubmit={handleRegister} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="full_name" className="form-control" onChange={handleChange} required />
            {errors.full_name && <div className="field-error">{errors.full_name}</div>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" onChange={handleChange} required />
            {errors.email && <div className="field-error">{errors.email}</div>}
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
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" onChange={handleChange} required />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Register Now
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>
          Already have an account? <Link to="/teacher/login" style={{ color: 'var(--accent-purple)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default TeacherRegister;
