import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Search, UserCheck, BarChart3, TrendingUp, X } from 'lucide-react';

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);

  // Filter States
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');

  // Student Details Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentActivities, setStudentActivities] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const teacherData = localStorage.getItem('teacher');
    if (!teacherData) {
      navigate('/teacher/login');
      return;
    }
    setTeacher(JSON.parse(teacherData));
    fetchStudents();
  }, [navigate]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students', err);
    }
  };

  const handleFilter = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      if (branch) params.append('branch', branch);
      if (semester) params.append('semester', semester);
      if (section) params.append('section', section);

      const res = await axios.get(`http://localhost:5000/students/filter?${params.toString()}`);
      setStudents(res.data);
    } catch (err) {
      console.error('Error filtering students', err);
    }
  };

  const viewStudentDetails = async (student) => {
    try {
      const res = await axios.get(`http://localhost:5000/activities/${student.student_id}`);
      setStudentActivities(res.data);
      setSelectedStudent(student);
    } catch (err) {
      console.error('Error fetching student activities', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacher');
    navigate('/');
  };

  if (!teacher) return <div className="flex-center" style={{ minHeight: '100vh' }}>Loading...</div>;

  // Calculate some simple stats
  const totalStudents = students.length;
  const uniqueBranches = new Set(students.map(s => s.branch)).size;
  const avgPoints = totalStudents ? Math.round(students.reduce((acc, curr) => acc + (curr.total_points || 0), 0) / totalStudents) : 0;
  const highestScore = students.length ? Math.max(...students.map(s => s.total_points || 0)) : 0;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <UserCheck size={28} className="text-success" />
          AICTE Admin
        </div>

        <div style={{ marginBottom: '2rem', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <p style={{ color: 'white', fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px' }}>{teacher.full_name}</p>
          <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>{teacher.email}</p>
          <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-blue)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
            {teacher.branch} Dept
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <button className="nav-link">
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button className="nav-link active">
            <Users size={20} />
            Student Records
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
            <h1>Teacher Portal 👋</h1>
            <p>Monitor student progress, verify activity records, and generate comprehensive AICTE point reports.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid-4 animate-fade-in" style={{ marginBottom: '32px', animationDelay: '0.1s' }}>
          <div className="glass-card">
            <div className="icon-wrapper icon-blue"><Users size={24} /></div>
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-title">Total Students</div>
          </div>
          
          <div className="glass-card">
            <div className="icon-wrapper icon-purple"><BarChart3 size={24} /></div>
            <div className="stat-value">{uniqueBranches}</div>
            <div className="stat-title">Active Branches</div>
          </div>
          
          <div className="glass-card">
            <div className="icon-wrapper icon-cyan"><TrendingUp size={24} /></div>
            <div className="stat-value">{avgPoints}</div>
            <div className="stat-title">Avg Points/Student</div>
          </div>
          
          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(6, 182, 212, 0.15))', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
            <div className="icon-wrapper icon-green"><UserCheck size={24} /></div>
            <div className="stat-value">{highestScore}</div>
            <div className="stat-title">Highest Score</div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '32px', animationDelay: '0.2s' }}>
          <h3 style={{ marginBottom: '16px' }}>Filter Records</h3>
          <form onSubmit={handleFilter} className="grid-3" style={{ alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Branch</label>
              <select className="form-control" value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option value="">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="ISE">ISE</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Semester</label>
              <select className="form-control" value={semester} onChange={(e) => setSemester(e.target.value)}>
                <option value="">All Semesters</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Section</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input type="text" className="form-control" placeholder="All Sections" value={section} onChange={(e) => setSection(e.target.value)} />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  <Search size={18} /> Filter
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Students List */}
        <div className="table-container animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <table className="table">
            <thead>
              <tr>
                <th>USN</th>
                <th>Name</th>
                <th>Branch</th>
                <th>Sem/Sec</th>
                <th>Total Points</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((stu) => (
                  <tr key={stu.student_id}>
                    <td style={{ fontWeight: 500 }}>{stu.usn}</td>
                    <td style={{ color: 'var(--text-main)' }}>{stu.full_name}</td>
                    <td>
                      <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.85rem' }}>{stu.branch}</span>
                    </td>
                    <td>{stu.semester} / {stu.section}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>{stu.total_points || 0}</td>
                    <td>
                      <button onClick={() => viewStudentDetails(stu)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ color: 'var(--text-muted)' }}>
                      <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p>No students found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Student Details Modal overlay */}
        {selectedStudent && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', border: '1px solid rgba(139, 92, 246, 0.4)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
              
              <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Student Details</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <p style={{ color: 'var(--accent-blue)', fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>{selectedStudent.full_name}</p>
                    <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>({selectedStudent.usn})</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                    <TrendingUp size={16} className="text-success" />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Points: </span>
                    <strong style={{ color: 'var(--success)' }}>{selectedStudent.total_points || 0}</strong>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="btn btn-outline" style={{ padding: '0.5rem', border: 'none' }}>
                  <X size={24} />
                </button>
              </div>

              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Activities Log</h3>

                <div className="table-container">
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
                      {studentActivities.length > 0 ? (
                        studentActivities.map((act, index) => (
                          <tr key={act.activity_id || index}>
                            <td>{new Date(act.activity_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            <td style={{ color: 'var(--text-main)' }}>{act.activity_name}</td>
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
                          <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No activities recorded for this student.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
