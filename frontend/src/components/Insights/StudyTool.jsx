import React, { useState } from 'react';
import { Upload, Globe, FileText, Loader2, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { uploadFile, analyzeUrl, askQuestion } from '../../services/api';

const StudyTool = () => {
    const [activeTab, setActiveTab] = useState('document'); // document | website
    const [loading, setLoading] = useState(false);
    const [docContext, setDocContext] = useState('');
    const [messages, setMessages] = useState([]); // { role: 'user' | 'ai', content: '' }
    const [question, setQuestion] = useState('');
    const [fileName, setFileName] = useState('');

    // Website state
    const [urls, setUrls] = useState([]);
    const [currentUrl, setCurrentUrl] = useState('');

    // Document handling
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setFileName(file.name);
        try {
            const data = await uploadFile(file);
            setDocContext(data.text);
            setMessages([{ role: 'ai', content: `**Processed ${data.filename}**\n\n${data.summary}` }]);
        } catch (error) {
            alert("Error processing file: " + error.message);
        }
        setLoading(false);
    };

    // Website handling
    const addUrl = () => {
        if (currentUrl && !urls.includes(currentUrl)) {
            setUrls([...urls, currentUrl]);
            setCurrentUrl('');
        }
    };

    const removeUrl = (urlToRemove) => {
        setUrls(urls.filter(u => u !== urlToRemove));
    };

    const handleUrlAnalyze = async () => {
        if (urls.length === 0) return;
        setLoading(true);
        try {
            const data = await analyzeUrl(urls);
            setDocContext(data.content);
            setMessages([{ role: 'ai', content: `**Analyzed ${urls.length} Websites**\n\n${data.summary}` }]);
        } catch (error) {
            alert("Error analyzing URL: " + error.message);
        }
        setLoading(false);
    };

    // Q&A
    const handleAsk = async () => {
        if (!question.trim() || !docContext) return;

        const userQ = question;
        setQuestion('');
        setMessages(prev => [...prev, { role: 'user', content: userQ }]);

        setLoading(true);
        try {
            const answer = await askQuestion(docContext, userQ);
            setMessages(prev => [...prev, { role: 'ai', content: answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: "Error: Could not get answer." }]);
        }
        setLoading(false);
    };

    return (
        <div className="container" style={{ padding: '2rem 0', maxWidth: '1000px' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>AI Study & Content Intelligence</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Upload documents or analyze websites to get instant answers.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                <TabButton
                    active={activeTab === 'document'}
                    onClick={() => setActiveTab('document')}
                    icon={<FileText size={18} />}
                    label="Document Study"
                />
                <TabButton
                    active={activeTab === 'website'}
                    onClick={() => setActiveTab('website')}
                    icon={<Globe size={18} />}
                    label="Website Study"
                />
            </div>

            <div className="card glass-panel" style={{ padding: '2rem', minHeight: '500px' }}>
                {/* Input Section */}
                <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                    {activeTab === 'document' ? (
                        <div style={{ textAlign: 'center', border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '3rem 1rem', transition: 'all 0.3s ease' }} className="hover-scale">
                            <Upload size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                            <h3>Click to upload document</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>PDF, DOCX, TXT supported</p>
                            <input
                                type="file"
                                accept=".pdf,.txt,.doc,.docx"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                                {loading ? <Loader2 className="spin" /> : 'Select File'}
                            </label>
                            {fileName && <p style={{ marginTop: '1rem', color: 'var(--accent-teal)' }}>Selected: {fileName}</p>}
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="https://example.com/article..."
                                    value={currentUrl}
                                    onChange={(e) => setCurrentUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addUrl()}
                                    style={{
                                        flex: 1,
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        color: 'white',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                    }}
                                />
                                <button className="btn btn-outline" onClick={addUrl} disabled={!currentUrl}>Add</button>
                            </div>

                            {/* URL Tags */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                {urls.map((u, i) => (
                                    <div key={i} style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                        <span style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u}</span>
                                        <span style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => removeUrl(u)}>×</span>
                                    </div>
                                ))}
                            </div>

                            <button className="btn btn-primary glow-effect" onClick={handleUrlAnalyze} disabled={loading || urls.length === 0} style={{ width: '100%' }}>
                                {loading ? <Loader2 className="spin" /> : `Analyze ${urls.length} Websites`}
                            </button>
                        </div>
                    )}
                </div>

                {/* Output / Chat Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                            <p>Results and chat history will appear here.</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            background: msg.role === 'user' ? 'var(--accent-color)' : 'var(--bg-secondary)',
                            padding: '1rem',
                            borderRadius: '12px',
                            borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                            borderBottomLeftRadius: msg.role === 'ai' ? '2px' : '12px'
                        }}>
                            <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
                                {msg.role === 'user' ? 'You' : 'Insight AI'}
                            </strong>
                            <div className="markdown-content">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-secondary)' }}>
                            <Loader2 className="spin" size={16} /> Processing...
                        </div>
                    )}
                </div>

                {/* Input Area */}
                {docContext && (
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Ask a question about the content..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                            style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }}
                        />
                        <button className="btn btn-primary" onClick={handleAsk} disabled={loading || !question.trim()}>
                            <Send size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '2rem',
            background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: active ? 'var(--accent-color)' : 'var(--text-secondary)',
            border: active ? '1px solid var(--accent-color)' : '1px solid transparent',
            transition: 'all 0.2s'
        }}
    >
        {icon} <span>{label}</span>
    </button>
);

export default StudyTool;
