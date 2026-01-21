import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Upload, Mic, Square, Play, Loader2, User, Trophy, ArrowRight, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { startInterviewSession, getNextInterviewQuestion, getInterviewFeedback, uploadFile } from '../../services/api';

const InterviewTool = () => {
    const [step, setStep] = useState('setup'); // setup | interview | feedback
    const [resumeText, setResumeText] = useState('');
    const [history, setHistory] = useState([]); // [{role: 'ai', content: 'Q1'}, {role: 'user', content: 'A1'}]
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [silenceTimer, setSilenceTimer] = useState(null);

    const webcamRef = useRef(null);
    const recognitionRef = useRef(null);

    // Auto-dictation logic
    useEffect(() => {
        if (!isListening || !transcript) return;
        if (silenceTimer) clearTimeout(silenceTimer);
        const timer = setTimeout(() => {
            toggleListening();
        }, 2500);
        setSilenceTimer(timer);
        return () => clearTimeout(timer);
    }, [transcript, isListening]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.onresult = (event) => {
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setTranscript(prev => prev + ' ' + event.results[i][0].transcript);
                    }
                }
            };
        }
    }, []);

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        try {
            const data = await uploadFile(file);
            setResumeText(data.text);
        } catch (err) {
            alert("Error parsing resume: " + err.message);
        }
        setLoading(false);
    };

    const startInterview = async () => {
        if (!resumeText) return alert("Please upload a resume first.");
        setLoading(true);
        try {
            const data = await startInterviewSession(resumeText);
            setCurrentQuestion(data.question);
            setHistory([{ role: 'ai', content: data.question }]);
            setStep('interview');
            speak(data.question);
        } catch (err) {
            alert("Could not start interview: " + err.message);
        }
        setLoading(false);
    };

    const nextQuestion = async () => {
        if (!transcript) return alert("Please answer the question first.");

        // Add user answer to history
        const newHistory = [...history, { role: 'user', content: transcript }];
        setHistory(newHistory);
        setTranscript('');
        setLoading(true);

        try {
            const data = await getNextInterviewQuestion(newHistory, resumeText);
            setCurrentQuestion(data.question);
            setHistory(prev => [...prev, { role: 'ai', content: data.question }]);
            speak(data.question);
        } catch (err) {
            alert("Error getting next question.");
        }
        setLoading(false);
    };

    const finishInterview = async () => {
        setLoading(true);
        setStep('feedback');
        try {
            // Include final answer if exists
            let finalHistory = history;
            if (transcript) {
                finalHistory = [...history, { role: 'user', content: transcript }];
            }
            const fbData = await getInterviewFeedback(resumeText, finalHistory);
            setFeedback(fbData);
        } catch (err) {
            setFeedback({ summary: "Error generating feedback." });
        }
        setLoading(false);
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0', height: 'calc(100vh - 80px)' }}>
            {step === 'setup' && (
                <div className="card glass-panel" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>AI Mock Interview</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Continuous, adaptive questions based on your resume.</p>

                    <div style={{ marginBottom: '2rem', border: '2px dashed var(--border-color)', padding: '2rem', borderRadius: '12px' }} className="hover-scale">
                        <Upload size={32} style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }} />
                        <input type="file" onChange={handleResumeUpload} style={{ display: 'none' }} id="resume-upload" accept=".pdf,.docx,.txt" />
                        <label htmlFor="resume-upload" className="btn btn-outline" style={{ cursor: 'pointer' }}>Choose Resume</label>
                        {resumeText && <p style={{ marginTop: '1rem', color: 'var(--success)' }}><CheckCircle size={16} style={{ display: 'inline' }} /> Resume Ready</p>}
                    </div>

                    <button className="btn btn-primary glow-effect" onClick={startInterview} disabled={!resumeText || loading} style={{ width: '100%' }}>
                        {loading ? <Loader2 className="spin" /> : 'Start Continuous Interview'}
                    </button>
                </div>
            )}

            {step === 'interview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', height: '100%' }}>
                    <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>Live Session</span>
                            <button className="btn btn-outline" onClick={finishInterview} style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
                                End Interview
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <p style={{ fontSize: '1.4rem', fontWeight: 500, lineHeight: '1.5', marginBottom: '2rem' }}>{currentQuestion}</p>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                    <Mic size={16} className={isListening ? "pulse-dot" : ""} />
                                    <span>{isListening ? "Listening..." : "Your Answer"}</span>
                                </div>
                                <p style={{ minHeight: '60px' }}>{transcript || <span style={{ opacity: 0.5 }}>Start speaking...</span>}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button className={`btn ${isListening ? 'btn-error' : 'btn-outline'}`} onClick={toggleListening} style={{ flex: 1 }}>
                                {isListening ? <><Square size={18} style={{ marginRight: 8 }} /> Stop</> : <><Mic size={18} style={{ marginRight: 8 }} /> Answer</>}
                            </button>
                            <button className="btn btn-primary" onClick={nextQuestion} disabled={!transcript} style={{ flex: 1 }}>
                                Next Question <ArrowRight size={18} style={{ marginLeft: 8 }} />
                            </button>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'black', position: 'relative' }}>
                        <Webcam ref={webcamRef} audio={false} mirrored style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>
            )}

            {step === 'feedback' && (
                <div className="container" style={{ maxWidth: '900px' }}>
                    <h1 className="gradient-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>Performance Analysis</h1>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <Loader2 className="spin" size={48} />
                            <p style={{ marginTop: '1rem' }}>Analyzing Interview Data...</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                            <div className="card glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                                <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 2rem' }}>
                                    <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="2" strokeOpacity="0.1" />
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#14b8a6" strokeWidth="2" strokeDasharray={`${feedback?.ats_score || 0}, 100`} />
                                    </svg>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '2rem', fontWeight: 'bold' }}>
                                        {feedback?.ats_score || 0}
                                    </div>
                                </div>
                                <h3>ATS Score</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Based on answer relevance & keywords</p>
                            </div>

                            <div className="card glass-panel" style={{ padding: '2rem' }}>
                                <h3 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Recommended Roles</h3>
                                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                                    {feedback?.recommended_roles?.map((role, i) => (
                                        <span key={i} className="badge" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>{role}</span>
                                    ))}
                                </div>

                                <h3 style={{ marginBottom: '1rem' }}>Key Improvements</h3>
                                <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
                                    {feedback?.key_improvements?.map((imp, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{imp}</li>
                                    ))}
                                </ul>

                                <div>
                                    <h3>Summary</h3>
                                    <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>{feedback?.summary}</p>
                                </div>

                                <button className="btn btn-primary" onClick={() => setStep('setup')} style={{ marginTop: '2rem' }}>Start New Session</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InterviewTool;
