import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Background */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url(/premium_tech_bg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.4,
                    zIndex: -1,
                    pointerEvents: 'none'
                }}
            />

            <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                <div className="container">
                    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '4rem' }}>

                        {/* BRAND */}
                        <h1
                            style={{
                                fontFamily: "'Poppins', system-ui, sans-serif",
                                fontSize: '4.5rem',
                                fontWeight: 700,
                                lineHeight: 1.1,
                                letterSpacing: '-0.03em',
                                marginBottom: '1.5rem',
                                background: 'linear-gradient(to right, #ffffff, #94a3b8)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            InsightMatrix
                        </h1>

                        {/* TAGLINE */}
                        <h2
                            style={{
                                fontFamily: "'Manrope', system-ui, sans-serif",
                                fontSize: '1.75rem',
                                fontWeight: 600,
                                marginBottom: '2rem',
                                color: 'var(--accent-teal)'
                            }}
                        >
                            Open AI tools for students. Simple. Private. Session-based.
                        </h2>

                        {/* BODY CONTENT */}
                        <p
                            style={{
                                fontFamily: "'Inter', system-ui, sans-serif",
                                fontSize: '1.125rem',
                                fontWeight: 400,
                                lineHeight: 1.75,
                                color: 'var(--text-secondary)',
                                marginBottom: '3rem',
                                maxWidth: '650px',
                                marginLeft: 'auto',
                                marginRight: 'auto'
                            }}
                        >
                            InsightMatrix is an open AI platform designed for students.
                            <br />
                            It provides essential tools for <strong>learning</strong>,{' '}
                            <strong>interview preparation</strong>, and{' '}
                            <strong>news understanding</strong> in one place.
                            <br /><br />
                            There are <strong>no user accounts</strong>,{' '}
                            <strong>no data storage</strong>, and{' '}
                            <strong>no long-term tracking</strong>.
                            Everything works <strong>session-based</strong>.
                            Once the website is closed, all data is gone.
                        </p>

                        {/* CTA */}
                        <button
                            onClick={() => navigate('/insights')}
                            className="btn btn-primary glow-effect"
                            style={{
                                fontFamily: "'Inter', system-ui, sans-serif",
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                padding: '1rem 2.5rem',
                                letterSpacing: '-0.01em',
                                boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                            }}
                        >
                            Start Exploring Insights
                            <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                        </button>
                    </div>

                    {/* FEATURES */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '2rem',
                            marginTop: '6rem',
                            textAlign: 'left'
                        }}
                    >
                        <FeatureCard
                            icon={<Zap color="var(--accent-teal)" />}
                            title="Instant Intelligence"
                            desc="Tools designed for speed. Get summaries, answers, and feedback instantly without setup."
                        />
                        <FeatureCard
                            icon={<Shield color="var(--accent-color)" />}
                            title="Completely Private"
                            desc="No login required. No database. Your data never leaves your current session."
                        />
                        <FeatureCard
                            icon={<Clock color="var(--success)" />}
                            title="Session Based"
                            desc="Close the tab, and it's gone. A fresh start every time you visit."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="landing-card" style={{ padding: '2rem' }}>
        <div
            style={{
                marginBottom: '1rem',
                background: 'rgba(255,255,255,0.05)',
                width: 'fit-content',
                padding: '0.75rem',
                borderRadius: '12px'
            }}
        >
            {icon}
        </div>

        <h3
            style={{
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '0.5rem'
            }}
        >
            {title}
        </h3>

        <p
            style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: '1rem',
                fontWeight: 400,
                lineHeight: 1.6,
                color: 'var(--text-secondary)'
            }}
        >
            {desc}
        </p>
    </div>
);

export default LandingPage;
