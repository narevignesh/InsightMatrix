import React, { useState, useEffect } from 'react';
import { Newspaper, Search, ArrowRight, Loader2, Plus, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeUrl, askQuestion, getTrendingNews } from '../../services/api';

const NewsTool = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [urls, setUrls] = useState([]);
    const [currentUrl, setCurrentUrl] = useState('');
    const [newsContext, setNewsContext] = useState('');
    const [summary, setSummary] = useState('');
    const [question, setQuestion] = useState('');
    const [chat, setChat] = useState([]);
    const [headlines, setHeadlines] = useState([]);
    const [loadingTrends, setLoadingTrends] = useState(true);

    // Fetch dynamic trending news
    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const trends = await getTrendingNews();
                setHeadlines(trends);
            } catch (error) {
                console.error("Failed to load trends", error);
            }
            setLoadingTrends(false);
        };
        fetchTrends();
    }, []);

    const addUrl = () => {
        if (currentUrl && !urls.includes(currentUrl)) {
            setUrls([...urls, currentUrl]);
            setCurrentUrl('');
        }
    };

    const removeUrl = (urlToRemove) => {
        setUrls(urls.filter(u => u !== urlToRemove));
    };

    const handleAnalyze = async (overrideUrl) => {
        const targetUrls = overrideUrl ? [overrideUrl] : urls;
        if (targetUrls.length === 0) return;

        setAnalyzing(true);
        setNewsContext('');
        setSummary('');
        setChat([]);

        try {
            const data = await analyzeUrl(targetUrls);
            setNewsContext(data.content);
            setSummary(data.summary);
        } catch (error) {
            setSummary(`Error: ${error.message}. Please try again.`);
        }
        setAnalyzing(false);
    };

    const handleAsk = async () => {
        if (!question.trim() || !newsContext) return;
        const q = question;
        setQuestion('');
        setChat(prev => [...prev, { role: 'user', content: q }]);

        try {
            const ans = await askQuestion(newsContext, q);
            setChat(prev => [...prev, { role: 'ai', content: ans }]);
        } catch (error) {
            setChat(prev => [...prev, { role: 'ai', content: "Error getting answer." }]);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', height: 'calc(100vh - 80px)' }}>
            {/* Left: Feed & Input */}
            <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '2rem', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Newspaper color="var(--accent-teal)" /> News Feed
                </h2>

                <div className="card glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Add Sources to Analyze</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Paste article URL..."
                            value={currentUrl}
                            onChange={(e) => setCurrentUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addUrl()}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }}
                        />
                        <button className="btn btn-outline" onClick={addUrl} disabled={!currentUrl}><Plus size={20} /></button>
                    </div>

                    {/* URL Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {urls.map((u, i) => (
                            <div key={i} style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', userSelect: 'all' }}>
                                <span style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u}</span>
                                <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeUrl(u)} />
                            </div>
                        ))}
                    </div>

                    <button className="btn btn-primary glow-effect" style={{ width: '100%' }} onClick={() => handleAnalyze()} disabled={analyzing || urls.length === 0}>
                        {analyzing ? <Loader2 className="spin" /> : `Analyze ${urls.length} Sources`}
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Trending Now (AI Generated)</h3>
                    {loadingTrends ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}><Loader2 className="spin" /></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {headlines.map((h, i) => (
                                <div key={i} className="card hover-scale" style={{ padding: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => handleAnalyze(h.url)}>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{h.title}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <span>{h.source}</span>
                                        <span>{h.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Analysis & Chat */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {!summary && !analyzing && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', flexDirection: 'column', gap: '1rem' }}>
                        <Search size={48} opacity={0.5} />
                        <p>Add URLs or select a headline to analyze.</p>
                    </div>
                )}

                {analyzing && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--accent-teal)', gap: '0.5rem' }}>
                        <Loader2 className="spin" size={32} /> Reading articles...
                    </div>
                )}

                {summary && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                        <div className="card glass-panel" style={{ padding: '2rem', marginBottom: '1rem', flex: '0 0 auto', maxHeight: '40vh', overflowY: 'auto' }}>
                            <h3 style={{ color: 'var(--accent-teal)', marginBottom: '1rem' }}>Article Intelligence</h3>
                            <ReactMarkdown>{summary}</ReactMarkdown>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                                {chat.map((msg, i) => (
                                    <div key={i} style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        background: msg.role === 'user' ? 'var(--accent-color)' : 'var(--bg-secondary)',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        maxWidth: '80%'
                                    }}>
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', paddingBottom: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Ask about the article..."
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }}
                                />
                                <button className="btn btn-outline" onClick={handleAsk}><ArrowRight size={20} /></button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsTool;
