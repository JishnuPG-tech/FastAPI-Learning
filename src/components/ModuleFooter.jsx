import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function ModuleFooter({ currentModule, hasNext, hasPrev, onNext, onPrev }) {

  return (
    <div className="mt-16 pt-8 border-t border-white/10 pb-12">
      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {hasPrev ? (
          <button
            onClick={onPrev}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5 w-full sm:w-auto justify-center shrink-0"
          >
            <ArrowLeft size={20} />
            <span>Previous Module</span>
          </button>
        ) : <div />}

        {hasNext && (
          <button
            onClick={onNext}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white transition-colors px-6 py-3 rounded-xl font-medium shadow-lg shadow-primary-500/20 w-full sm:w-auto justify-center shrink-0"
          >
            <span>Next Module</span>
            <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
