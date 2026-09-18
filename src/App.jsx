// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ===== AUTH PAGES =====
import SendPayment from './Pages/Admin/private/Payments/SendPayment';
import AdminSignUp from './Pages/Admin/auth/AdminSignUp';
import AdminSignIn from './Pages/Admin/auth/AdminSignIn';
import AgentSignUp from './Pages/Agent/auth/AgentSignUp';
import AgentSignIn from './Pages/Agent/auth/AgentSignIn';
import AgentStatus from './Pages/Agent/status/AgentStatus';
// ===== ADMIN UNIVERSITIES =====
import Universities from './Pages/Admin/private/Universities/Universities';
import AddUniversity from './Pages/Admin/private/Universities/AddUniversity';
import UniversityDetail from './Pages/Admin/private/Universities/UniversityDetail';
// import AgentPayments from './Pages/Agent/private/Payments/AgentPayments';
// ===== ADMIN PROGRAMS =====
import Programs from './Pages/Admin/private/Programs/Programs';
import AddProgram from './Pages/Admin/private/Programs/AddProgram';
import ProgramDetail from './Pages/Admin/private/Programs/ProgramDetail';

// ===== ADMIN APPLICATIONS ⭐ =====
import ViewApplications from './Pages/Admin/private/Applications/ViewApplications';
import AdminApplications from './Pages/Admin/private/Applications/AdminApplications';
import AdminViewApplication from './Pages/Admin/private/Applications/AdminViewApplication';
import AdminEditApplication from './Pages/Admin/private/Applications/AdminEditApplication';
import Payments from './Pages/Admin/private/Payments/Payments';

// ===== AGENT PAGES =====
import AgentDashboard from './Pages/Agent/private/AgentDashboard';
import StudentApplication from './Pages/Agent/private/Application/StudentApplication';
import MyApplications from './Pages/Agent/private/Application/MyApplications';
import ViewApplication from './Pages/Agent/private/Application/ViewApplication';

// ===== ADMIN PAGES =====
import AdminDashboard from './Pages/Admin/private/AdminDashboard';

// ===== LAYOUTS =====
import AdminLayout from './Layout/AdminLayout';
import AgentLayout from './Layout/AgentLayout';

// ===== 404 =====
import NotFound from './Pages/NotFound/NotFound';

import './App.css';
import ReceivePayment from './Pages/Admin/private/Payments/ReceivePayment';
import AgentPayments from './Pages/Agent/Payments/AgentPayments';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* ===== DEFAULT ===== */}
                    <Route path="/" element={<Navigate to="/signup" replace />} />

                    {/* ===== ADMIN AUTH ROUTES ===== */}
                    <Route path="/signup" element={<AdminSignUp />} />
                    <Route path="/signin" element={<AdminSignIn />} />

                    {/* ===== AGENT AUTH ROUTES ===== */}
                    <Route path="/agent/signup" element={<AgentSignUp />} />
                    <Route path="/agent/login" element={<AgentSignIn />} />
                    <Route path="/agent/status" element={<AgentStatus />} />

                    {/* ============================================ */}
                    {/* ADMIN LAYOUT ROUTES */}
                    {/* ============================================ */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />

                        {/* ===== AGENTS MANAGEMENT ===== */}
                        <Route path="agents" element={<ViewApplications />} />
                        <Route path="agents/pending" element={<ViewApplications />} />
                        <Route path="agents/approved" element={<ViewApplications />} />
                        <Route path="agents/rejected" element={<ViewApplications />} />
<Route path="payments/receive" element={<ReceivePayment />} />
<Route path="payments/send" element={<SendPayment />} />
<Route path="payments" element={<Payments />} />
                        {/* ===== UNIVERSITIES ===== */}
                        <Route path="universities" element={<Universities />} />
                        <Route path="universities/add" element={<AddUniversity />} />
                        <Route path="universities/edit/:id" element={<AddUniversity />} />
                        <Route path="universities/:id" element={<UniversityDetail />} />

                        {/* ===== PROGRAMS ===== */}
                        <Route path="programs" element={<Programs />} />
                        <Route path="programs/add" element={<AddProgram />} />
                        <Route path="programs/edit/:id" element={<AddProgram />} />
                        <Route path="programs/:id" element={<ProgramDetail />} />

                        {/* ============================================ */}
                        {/* ⭐ APPLICATIONS MANAGEMENT (NEW) */}
                        {/* ============================================ */}
                        
                        {/* 1. All Applications List */}
                        <Route path="applications" element={<AdminApplications />} />
                        
                        {/* 2. Edit Application (specific route - MUST come before :id) */}
                        <Route path="applications/edit/:id" element={<AdminEditApplication />} />
                        
                        {/* 3. View Single Application (generic :id) */}
                        <Route path="applications/:id" element={<AdminViewApplication />} />

                        {/* Future Pages */}
                        {/* <Route path="agents/:id" element={<AgentDetail />} /> */}
                        {/* <Route path="users" element={<AdminUsers />} /> */}
                        {/* <Route path="reports" element={<AdminReports />} /> */}
                        {/* <Route path="settings" element={<AdminSettings />} /> */}
                        {/* <Route path="profile" element={<AdminProfile />} /> */}
                    </Route>

                    {/* ============================================ */}
                    {/* AGENT LAYOUT ROUTES */}
                    {/* ============================================ */}
                    <Route path="/agent" element={<AgentLayout />}>
                        <Route index element={<Navigate to="/agent/dashboard" replace />} />
                        <Route path="dashboard" element={<AgentDashboard />} />
                        
                        {/* Student Application */}
                        <Route path="student-application" element={<StudentApplication />} />
                        <Route path="my-applications" element={<MyApplications />} />
                        <Route path="view-application/:id" element={<ViewApplication />} />
                        <Route path="payments" element={<AgentPayments />} />
                        {/* Future Pages */}
                        {/* <Route path="edit-application/:id" element={<EditApplication />} /> */}
                        {/* <Route path="students" element={<AgentStudents />} /> */}
                        {/* <Route path="profile" element={<AgentProfile />} /> */}
                        {/* <Route path="settings" element={<AgentSettings />} /> */}
                    </Route>

                    {/* ===== 404 ===== */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;