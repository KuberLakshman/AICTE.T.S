import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getServerFieldErrors, validateLogin } from '../../utils/authValidation';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin({ email, password });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;
    
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      if (response.data.message === "Login Successful") {
        localStorage.setItem('student', JSON.stringify(response.data.student));
        navigate('/student/dashboard');
      }
    } catch (err) {
      setErrors(getServerFieldErrors(err));
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card animate-fade-in">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Student Login</h2>
        
        {errors.form && <div className="form-error">{errors.form}</div>}
        
        <form onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="Enter your VVCE email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((current) => ({ ...current, email: '', form: '' }));
              }}
              required 
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((current) => ({ ...current, password: '', form: '' }));
              }}
              required 
            />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Login to Portal
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>
          Don't have an account? <Link to="/student/register" style={{ color: 'var(--accent-purple)' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
