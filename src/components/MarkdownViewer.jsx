import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { BookOpen, Hash, ChevronRight, Copy, Check } from 'lucide-react';

const CodeBlock = ({ match, children, style, ...props }) => {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');
  
  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden my-6 border border-white/10 shadow-2xl relative group">
      <div className="bg-dark-800 border-b border-white/5 py-1.5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-xs text-gray-500 font-mono ml-2 uppercase tracking-wider">{match[1]}</span>
        </div>
        <button 
          onClick={handleCopy}
          aria-label="Copy code"
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        {...props}
        children={codeString}
        style={style}
        language={match[1]}
        PreTag="div"
        codeTagProps={{
          style: { fontSize: '0.85rem', lineHeight: '1.4' }
        }}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: '#0a0a0a',
        }}
      />
    </div>
  );
};

export default function MarkdownViewer({ content }) {
  // Strip emojis from the content so they don't render via Markdown
  const cleanContent = content.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '');
  return (
    <div className="markdown-body max-w-none mx-auto w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, children, ...props}) => <h1 {...props} className="flex items-center gap-3 mt-4 mb-6"><BookOpen className="text-primary-500 shrink-0" size={28}/> <span>{children}</span></h1>,
          h2: ({node, children, ...props}) => <h2 {...props} className="flex items-center gap-2 mt-8 mb-4"><Hash className="text-gray-400 shrink-0" size={22}/> <span>{children}</span></h2>,
          h3: ({node, children, ...props}) => <h3 {...props} className="flex items-center gap-1.5 mt-6 mb-3"><ChevronRight className="text-gray-500 shrink-0" size={20}/> <span>{children}</span></h3>,
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <CodeBlock match={match} style={vscDarkPlus} {...props}>
                {children}
              </CodeBlock>
            ) : (
              <code {...props} className={className}>
                {children}
              </code>
            );
          }
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
}
