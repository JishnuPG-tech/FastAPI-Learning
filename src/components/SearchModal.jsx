import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Search, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchModal({ isOpen, onClose, modules, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const fuse = new Fuse(modules, {
      keys: ['title', 'content'],
      threshold: 0.3,
      ignoreLocation: true,
      includeMatches: true
    });

    const fResults = fuse.search(query).slice(0, 5); // top 5 results
    setResults(fResults);
  }, [query, modules]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 sm:pt-32">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 mx-4"
        >
          <div className="flex items-center px-4 border-b border-white/10">
            <Search size={20} className="text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent border-0 text-white px-4 py-4 focus:ring-0 focus:outline-none placeholder:text-gray-500 text-lg"
              placeholder="Search API topics, syntax, headers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query && results.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                No results found for "<span className="text-white">{query}</span>"
              </div>
            )}
            
            {results.map((res, i) => (
              <button
                key={i}
                className="w-full flex flex-col text-left p-4 hover:bg-white/5 rounded-xl transition-colors mb-1"
                onClick={() => {
                  onSelect(res.item);
                  onClose();
                }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <FileText size={16} className="text-primary-500" />
                  <span className="font-semibold text-white">{res.item.title}</span>
                  <span className="text-xs text-gray-500 ml-auto border border-white/10 px-2 py-0.5 rounded-full">
                    Module {res.item.order}
                  </span>
                </div>
                {/* Show context match snippet */}
                <div className="text-sm text-gray-400 line-clamp-2 pl-7 mt-1">
                  ...{res.item.content.substring(50, 200).replace(/#/g, '')}...
                </div>
              </button>
            ))}
            
            {!query && (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm">Start typing to search across the entire course.</p>
                <div className="flex justify-center gap-2 mt-4 text-xs">
                  <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-400">Depends()</span>
                  <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-400">SQLAlchemy</span>
                  <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-400">JWT Token</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
