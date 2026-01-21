import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Video, Newspaper, ArrowRight } from 'lucide-react';

const InsightsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>
                Explore <span className="text-gradient">Insights</span>
            </h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                <InsightCard
                    icon={<FileText size={32} color="var(--accent-teal)" />}
                    title="AI Study & Content Intelligence"
                    desc="Upload documents, paste URLs, and ask questions. Get instant summaries and answers from your content."
                    onClick={() => navigate('/study')}
                />
                <InsightCard
                    icon={<Video size={32} color="var(--accent-color)" />}
                    title="AI Mock Interview System"
                    desc="Practice interviews with AI feedback. Get scored on communication, confidence, and ATS compatibility."
                    onClick={() => navigate('/interview')}
                />
                <InsightCard
                    icon={<Newspaper size={32} color="#f472b6" />}
                    title="AI News Intelligence"
                    desc="Understand news articles better. Get summaries, context, and ask questions about current events."
                    onClick={() => navigate('/news')}
                />
            </div>
        </div>
    );
};

const InsightCard = ({ icon, title, desc, onClick }) => (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ marginBottom: '1.5rem' }}>{icon}</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', flex: 1 }}>{desc}</p>
        <button className="btn btn-outline" style={{ width: '100%' }} onClick={onClick}>
            Open Tool <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
        </button>
    </div>
);

export default InsightsPage;
