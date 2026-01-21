import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, FileText, Video, Newspaper } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-color)',
            padding: '1rem 0'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                    <Brain style={{ color: 'var(--accent-color)' }} />
                    <span>InsightMatrix</span>
                </Link>

                <div style={{ display: 'flex', gap: '2rem' }}>
                    <NavLink to="/" label="Home" active={isActive('/')} />
                    <NavLink to="/insights" label="Insights" active={isActive('/insights')} />
                    <NavLink to="/study" label="Study AI" icon={<FileText size={18} />} active={isActive('/study')} />
                    <NavLink to="/interview" label="Mock Interview" icon={<Video size={18} />} active={isActive('/interview')} />
                    <NavLink to="/news" label="News AI" icon={<Newspaper size={18} />} active={isActive('/news')} />
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, label, icon, active }) => (
    <Link to={to} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: active ? 'var(--accent-color)' : 'var(--text-secondary)',
        fontWeight: active ? 500 : 400,
        transition: 'color 0.2s',
        borderBottom: active ? '2px solid var(--accent-color)' : '2px solid transparent',
        paddingBottom: '0.25rem'
    }}>
        {icon}
        <span>{label}</span>
    </Link>
);

export default Navbar;
