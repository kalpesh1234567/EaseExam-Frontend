import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CreateExam from './pages/CreateExam';
import ExamResults from './pages/ExamResults';
import SubmitSheet from './pages/SubmitSheet';
import MyResult from './pages/MyResult';
import CreateClassroom from './pages/CreateClassroom';
import ViewClassroom from './pages/ViewClassroom';
import StudentsWork from './pages/StudentsWork';

function PrivateRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <Navigate to="/teacher-dashboard" replace />;
  return <Navigate to="/student-dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        
        <Route path="/dashboard" element={<PrivateRoute><DashboardRedirect /></PrivateRoute>} />
        
        {/* Teacher Routes */}
        <Route path="/teacher-dashboard" element={<PrivateRoute role="teacher"><TeacherDashboard /></PrivateRoute>} />
        <Route path="/create-exam" element={<PrivateRoute role="teacher"><CreateExam /></PrivateRoute>} />
        <Route path="/create-classroom" element={<PrivateRoute role="teacher"><CreateClassroom /></PrivateRoute>} />
        <Route path="/exam-results/:examId" element={<PrivateRoute role="teacher"><ExamResults /></PrivateRoute>} />
        <Route path="/students-work/:examId" element={<PrivateRoute role="teacher"><StudentsWork /></PrivateRoute>} />
        
        {/* General Protected Routes */}
        <Route path="/classroom/:id" element={<PrivateRoute><ViewClassroom /></PrivateRoute>} />
        
        {/* Student Routes */}
        <Route path="/student-dashboard" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
        <Route path="/submit-sheet/:examId" element={<PrivateRoute role="student"><SubmitSheet /></PrivateRoute>} />
        <Route path="/my-result/:examId" element={<PrivateRoute role="student"><MyResult /></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
