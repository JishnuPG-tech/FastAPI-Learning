import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCourseModules } from './utils/courses';
import Sidebar from './components/Sidebar';
import MarkdownViewer from './components/MarkdownViewer';
import ModuleFooter from './components/ModuleFooter';
import SearchModal from './components/SearchModal';
import { Menu, Check, Search } from 'lucide-react';

export default function App() {
  const [modules, setModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const rafRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const loadedModules = getCourseModules();
    setModules(loadedModules);
    
    // Check local storage for progress
    const saved = localStorage.getItem('fastapi-course-progress');
    if (saved) {
      setCompletedModules(JSON.parse(saved));
    }
    // Check local storage for the currently active module
    const savedModuleId = localStorage.getItem('fastapi-course-current-module');

    if (loadedModules.length > 0) {
      if (savedModuleId) {
        const foundModule = loadedModules.find(m => m.id === savedModuleId);
        setCurrentModule(foundModule || loadedModules[0]);
      } else {
        setCurrentModule(loadedModules[0]);
      }
    }

    // Responsive check
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleModuleSelect = (mod) => {
    setCurrentModule(mod);
    localStorage.setItem('fastapi-course-current-module', mod.id);
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleScroll = useCallback((e) => {
    if (rafRef.current) return; // skip if a frame is already queued
    rafRef.current = requestAnimationFrame(() => {
      const el = e.target;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100 || 0;
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${pct}%`;
      }
      rafRef.current = null;
    });
  }, []);
  
  // Scroll to top when module changes
  useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0 });
    }
  }, [currentModule]);

  const toggleComplete = () => {
    if (!currentModule) return;
    
    const newCompleted = completedModules.includes(currentModule.id)
      ? completedModules.filter(id => id !== currentModule.id)
      : [...completedModules, currentModule.id];
      
    setCompletedModules(newCompleted);
    localStorage.setItem('fastapi-course-progress', JSON.stringify(newCompleted));
  };

  const navigateModule = (direction) => {
    if (!currentModule) return;
    const currentIndex = modules.findIndex(m => m.id === currentModule.id);
    const nextIndex = currentIndex + direction;
    
    if (nextIndex >= 0 && nextIndex < modules.length) {
      handleModuleSelect(modules[nextIndex]);
    }
  };

  if (!currentModule) return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white">Loading...</div>;

  const currentIndex = modules.findIndex(m => m.id === currentModule.id);
  const hasNext = currentIndex < modules.length - 1;
  const hasPrev = currentIndex > 0;
  const isCompleted = completedModules.includes(currentModule.id);

  return (
    <div className="flex h-screen bg-dark-900 text-gray-200 overflow-hidden font-sans selection:bg-primary-500/30">
      
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        modules={modules} 
        onSelect={handleModuleSelect} 
      />

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(6px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Area */}
      <AnimatePresence mode="popLayout" initial={false}>
        {isSidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: -264, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -264, opacity: 0 }}
            transition={{
              x: { type: 'spring', stiffness: 350, damping: 35 },
              opacity: { duration: 0.2, ease: 'easeOut' }
            }}
            className="fixed md:relative inset-y-0 left-0 z-50 h-full"
            style={{ boxShadow: '4px 0 32px rgba(0,0,0,0.5)' }}
          >
            <Sidebar 
              modules={modules} 
              currentModule={currentModule} 
              onSelect={handleModuleSelect}
              completedModules={completedModules}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full h-screen overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-16 shrink-0 bg-dark-900/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Toggle Sidebar"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-500">
                {currentModule.isIndex ? 'Introduction' : `Module ${currentModule.order}`}
              </span>
              <span className="ml-3 text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-medium tracking-wide">
                ⏱️ {currentModule.readTime} Min Read
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 text-sm text-gray-400 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-lg transition-colors"
             >
              <Search size={16} />
              <span>Search</span>
              <kbd className="ml-2 font-mono text-[10px] bg-dark-900 border border-white/10 px-1.5 py-0.5 rounded text-gray-500">Ctrl K</kbd>
             </button>
             


             <button
              onClick={toggleComplete}
              title="Force mark complete"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                isCompleted 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Check size={16} />
            </button>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="h-0.5 bg-white/5 w-full absolute top-16 left-0 z-20 pointer-events-none">
          <div
            ref={progressBarRef}
            className="h-full bg-blue-500 rounded-r-full"
            style={{ width: '0%', willChange: 'width', transition: 'none' }}
          />
        </div>

        {/* Scrollable Content */}
        <main
          id="main-scroll-container"
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto relative"
          style={{ overscrollBehavior: 'contain', willChange: 'scroll-position' }}
        >
          <div className="px-4 py-8 lg:px-12 lg:py-12 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentModule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MarkdownViewer content={currentModule.content} />
                
                <ModuleFooter 
                  currentModule={currentModule}
                  hasNext={hasNext} 
                  hasPrev={hasPrev} 
                  onNext={() => navigateModule(1)} 
                  onPrev={() => navigateModule(-1)} 
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
