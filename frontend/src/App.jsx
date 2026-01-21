import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import LandingPage from './components/LandingPage';
import InsightsPage from './components/InsightsPage';
import StudyTool from './components/Insights/StudyTool';
import InterviewTool from './components/Insights/InterviewTool';
import NewsTool from './components/Insights/NewsTool';
import AnimatedPage from './components/UI/AnimatedPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><LandingPage /></AnimatedPage>} />
        <Route path="/insights" element={<AnimatedPage><InsightsPage /></AnimatedPage>} />
        <Route path="/study" element={<AnimatedPage><StudyTool /></AnimatedPage>} />
        <Route path="/interview" element={<AnimatedPage><InterviewTool /></AnimatedPage>} />
        <Route path="/news" element={<AnimatedPage><NewsTool /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <AnimatedRoutes />
        </main>
        <ConditionalFooter />
      </div>
    </Router>
  );
}

function ConditionalFooter() {
  const location = useLocation();
  // Only show footer on Landing (/) and Insights (/insights)
  const showFooter = ['/', '/insights'].includes(location.pathname);

  return showFooter ? <Footer /> : null;
}

export default App;
