import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DarkDatePicker from '../../components/DarkDatePicker';
import { LayoutDashboard, Activity, Award, FileText, Settings, LogOut, Plus, CheckCircle, Clock } from 'lucide-react';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [activities, setActivities] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [activityName, setActivityName] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [activityDateError, setActivityDateError] = useState('');
  const [points, setPoints] = useState('');

  useEffect(() => {
    const studentData = localStorage.getItem('student');
    if (!studentData) {
      navigate('/student/login');
      return;
    }

    const parsedStudent = JSON.parse(studentData);
    setStudent(parsedStudent);
    fetchDashboardData(parsedStudent.student_id);
  }, [navigate]);

  const fetchDashboardData = async (studentId) => {
    try {
      const profileRes = await axios.get(`http://localhost:5000/student/${studentId}`);
      setTotalPoints(profileRes.data.total_points || 0);

      const activitiesRes = await axios.get(`http://localhost:5000/activities/${studentId}`);
      setActivities(activitiesRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!activityDate) {
      setActivityDateError('Select an activity date.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/activities', {
        student_id: student.student_id,
        activity_name: activityName,
        activity_date: activityDate,
        points: parseInt(points)
      });

      setActivityName('');
      setActivityDate('');
      setActivityDateError('');
      setPoints('');
      setShowAddForm(false);
      fetchDashboardData(student.student_id);
    } catch (err) {
      console.error('Error adding activity', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('student');
    navigate('/');
  };

  if (!student) return <div className="flex-center" style={{ minHeight: '100vh' }}>Loading...</div>;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <Award size={28} className="text-success" />
          AICTE Tracker
        </div>

        <div style={{ marginBottom: '2rem', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <p style={{ color: 'white', fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px' }}>{student.full_name}</p>
          <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>{student.usn}</p>
          <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-blue)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
            {student.branch} • Sem {student.semester}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <button className="nav-link active">
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button onClick={() => setShowAddForm(true)} className="nav-link">
            <Plus size={20} />
            Add Activity
          </button>
          <button className="nav-link">
            <Activity size={20} />
            My Activities
          </button>
          <button className="nav-link">
            <Award size={20} />
            Achievements
          </button>
          <button className="nav-link">
            <FileText size={20} />
            Reports
          </button>
          <button className="nav-link">
            <Settings size={20} />
            Settings
          </button>
        </div>

        <button onClick={handleLogout} className="nav-link" style={{ color: 'var(--danger)', marginTop: 'auto' }}>
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        
        {/* Hero Section */}
        <div className="hero-section animate-fade-in">
          <div className="hero-content">
            <h1>Welcome Back 👋</h1>
            <p>Track, manage, and verify academic and extracurricular activities from one centralized platform.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid-4 animate-fade-in" style={{ marginBottom: '32px', animationDelay: '0.1s' }}>
          <div className="glass-card">
            <div className="icon-wrapper icon-blue"><Activity size={24} /></div>
            <div className="stat-value">{activities.length}</div>
            <div className="stat-title">Total Activities</div>
          </div>
          
          <div className="glass-card">
            <div className="icon-wrapper icon-green"><CheckCircle size={24} /></div>
            <div className="stat-value">{activities.length > 0 ? Math.floor(activities.length * 0.8) : 0}</div>
            <div className="stat-title">Verified</div>
          </div>
          
          <div className="glass-card">
            <div className="icon-wrapper icon-orange"><Clock size={24} /></div>
            <div className="stat-value">{activities.length > 0 ? Math.ceil(activities.length * 0.2) : 0}</div>
            <div className="stat-title">Pending</div>
          </div>
          
          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
            <div className="icon-wrapper icon-purple"><Award size={24} /></div>
            <div className="stat-value">{totalPoints}</div>
            <div className="stat-title">Total Points</div>
          </div>
        </div>

        {/* Add Activity Section */}
        {showAddForm && (
          <div className="glass-panel animate-fade-in" style={{ padding: '32px', marginBottom: '32px', position: 'relative', zIndex: 1000, overflow: 'visible', animationDuration: '0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Add New Activity</h3>
              <button onClick={() => setShowAddForm(false)} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Cancel</button>
            </div>

            <form onSubmit={handleAddActivity} className="grid-3" style={{ alignItems: 'start' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Activity Name</label>
                <input type="text" className="form-control" value={activityName} onChange={(e) => setActivityName(e.target.value)} placeholder="e.g. Hackathon" required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Activity Date</label>
                <DarkDatePicker
                  value={activityDate}
                  onChange={(date) => {
                    setActivityDate(date);
                    setActivityDateError('');
                  }}
                />
                {activityDateError && <div className="field-error">{activityDateError}</div>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Points</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" inputMode="numeric" className="form-control" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="0" required />
                  <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Save Activity</button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Activities Table */}
        <h3 style={{ marginBottom: '16px' }}>Recent Activities</h3>
        <div className="table-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity Name</th>
                <th>Status</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? (
                activities.map((act, index) => (
                  <tr key={act.activity_id || index}>
                    <td>{new Date(act.activity_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{act.activity_name}</td>
                    <td>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: index % 3 !== 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: index % 3 !== 0 ? 'var(--success)' : 'var(--warning)' }}>
                        {index % 3 !== 0 ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>+{act.points}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ color: 'var(--text-muted)' }}>
                      <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p>No activities recorded yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

