import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2 } from 'lucide-react';

export default function Sidebar({ modules, currentModule, onSelect, completedModules }) {
  const progress = modules.length > 0 ? Math.round((completedModules.length / modules.length) * 100) : 0;

  return (
    <div className="w-64 h-full flex flex-col bg-[#0d0d0d] border-r border-white/[0.06] overflow-hidden">

      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-white/[0.06] sticky top-0 bg-[#0d0d0d] z-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
            <Zap size={14} className="text-blue-400 fill-blue-400/30" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">FastAPI</span>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Progress</span>
            <span className="text-[10px] font-bold text-blue-400">{progress}%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[10px] text-gray-600">
            {completedModules.length} of {modules.length} completed
          </p>
        </div>
      </div>

      {/* Module List */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {modules.map((mod, idx) => {
          const isActive = currentModule?.id === mod.id;
          const isComplete = completedModules.includes(mod.id);
          const isIndex = mod.isIndex;

          return (
            <motion.button
              key={mod.id}
              onClick={() => onSelect(mod)}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all duration-150 group mb-0.5 ${
                isActive
                  ? 'bg-blue-500/10 text-blue-300'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'
              }`}
            >
              {/* Status dot / check */}
              <div className="shrink-0 w-4 flex items-center justify-center">
                {isComplete ? (
                  <CheckCircle2
                    size={14}
                    className={isActive ? 'text-blue-400' : 'text-emerald-500/80'}
                    strokeWidth={2.5}
                  />
                ) : (
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isActive ? 'bg-blue-400' : 'bg-gray-700 group-hover:bg-gray-500'
                    }`}
                  />
                )}
              </div>

              {/* Module number + title */}
              <div className="flex-1 min-w-0">
                {!isIndex && (
                  <span className={`text-[9px] font-bold uppercase tracking-wider block leading-none mb-0.5 ${
                    isActive ? 'text-blue-500' : 'text-gray-700 group-hover:text-gray-600'
                  }`}>
                    {String(mod.order).padStart(2, '0')}
                  </span>
                )}
                <p className={`text-xs leading-tight line-clamp-1 font-medium ${
                  isActive ? 'text-blue-200' : ''
                }`}>
                  {mod.title}
                </p>
              </div>

              {/* Active accent line */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="w-0.5 h-4 bg-blue-400 rounded-full shrink-0"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
