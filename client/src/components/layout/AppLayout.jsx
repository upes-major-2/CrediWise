import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AppLayout.css';

const NAV_ITEMS = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/recommend', icon: '✨', label: 'Recommend' },
    { to: '/expenses', icon: '💳', label: 'Expenses' },
    { to: '/instruments', icon: '🏦', label: 'My Cards' },
    { to: '/reports', icon: '📈', label: 'Reports' },
    { to: '/profile', icon: '👤', label: 'Profile' },
];

export default function AppLayout() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="app-layout">
            {/* Mobile overlay */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="logo-icon">💎</div>
                    <span className="logo-text">CrediWise</span>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                    {isAdmin && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="nav-icon">⚙️</span>
                            <span className="nav-label">Admin</span>
                        </NavLink>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="avatar">{user?.avatarInitials || user?.name?.substring(0, 2).toUpperCase()}</div>
                        <div className="user-details">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        🚪
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="main-content">
                {/* Mobile header */}
                <header className="mobile-header">
                    <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
                    <span className="mobile-logo">💎 CrediWise</span>
                    <div className="avatar sm">{user?.avatarInitials || user?.name?.substring(0, 2).toUpperCase()}</div>
                </header>

                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
