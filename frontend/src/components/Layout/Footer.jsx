import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            borderTop: '1px solid var(--border-color)',
            padding: '2rem 0',
            marginTop: 'auto',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
        }}>
            <div className="container">
                <p>InsightMatrix — Open, session-based AI tools for students</p>
            </div>
        </footer>
    );
};

export default Footer;
