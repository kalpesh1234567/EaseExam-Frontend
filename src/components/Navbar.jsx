import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">EasyExam</Link>
      {user && (
        <div className="navbar-actions">
          <span className="navbar-user">
            {user.firstName} {user.lastName}
          </span>
          <span className={`badge badge-${user.role}`}>{user.role}</span>
          <button id="logout-btn" className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
