import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '60px', textAlign: 'center', maxWidth: '800px', width: '100%' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AICTE tracking system
        </h1>

        <p style={{ fontSize: '1.2rem', marginBottom: '3rem' }}>
          Are you a student or a teacher?
        </p>

        <div className="grid-2">
          {/* Student Portal Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 600 }}>Student</div>
            <img
              src="/Student.jpg"
              alt="Student"
              style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
            />
            <h2 style={{ marginBottom: '1rem' }}>Student Portal</h2>
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <Link to="/student/login" className="btn btn-primary" style={{ flex: 1 }}>Login</Link>
              <Link to="/student/register" className="btn btn-outline" style={{ flex: 1 }}>Register</Link>
            </div>
          </div>

          {/* Teacher Portal Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 600 }}>Teacher</div>
            <img
              src="/Teacher.jpg"
              alt="Teacher"
              style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
            />
            <h2 style={{ marginBottom: '1rem' }}>Teacher Portal</h2>
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <Link to="/teacher/login" className="btn btn-primary" style={{ flex: 1 }}>Login</Link>
              <Link to="/teacher/register" className="btn btn-outline" style={{ flex: 1 }}>Register</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
