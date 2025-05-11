'use client';

import { motion } from 'framer-motion';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ComponentPropsWithoutRef } from 'react';

interface MessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

type CodeBlockProps = ComponentPropsWithoutRef<'code'> & {
  inline?: boolean;
  className?: string;
};

export default function Message({ role, content, timestamp }: MessageProps) {
  // Format the timestamp
  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  
  // Style and animations based on message role
  const isUser = role === 'user';

  // Define markdown components
  const components: Components = {
    code({ className, children, ...props }: CodeBlockProps) {
      const match = /language-(\w+)/.exec(className || '');
      return !props.inline && match ? (
        <div className="rounded-md text-xs sm:text-sm overflow-hidden">
          <SyntaxHighlighter
            style={coldarkDark}
            language={match[1]}
            PreTag="div"
            customStyle={{ margin: 0, padding: '0.75rem' }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code {...props} className={`${className} ${isUser ? 'bg-emerald-700 text-emerald-50' : 'bg-gray-100 text-emerald-800'} px-1 py-0.5 rounded text-xs sm:text-sm`}>
          {children}
        </code>
      );
    },
    ul({ children }) {
      return <ul className="list-disc pl-4 my-1 text-sm">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal pl-4 my-1 text-sm">{children}</ol>;
    },
    li({ children }) {
      return <li className="my-0.5">{children}</li>;
    },
    a({ children, href }) {
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`${isUser ? 'text-emerald-100 underline' : 'text-emerald-600 font-medium hover:underline'}`}
        >
          {children}
        </a>
      );
    },
    h3({ children }) {
      return <h3 className="text-sm sm:text-base font-bold mt-2 mb-1">{children}</h3>;
    },
    p({ children }) {
      return <p className="mb-1.5 last:mb-0 text-sm">{children}</p>;
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto my-1.5 text-xs sm:text-sm">
          <table className="border-collapse border border-gray-300 w-full">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className={isUser ? "bg-emerald-700" : "bg-emerald-50"}>{children}</thead>;
    },
    th({ children }) {
      return <th className="border border-gray-300 px-2 py-1 text-left">{children}</th>;
    },
    td({ children }) {
      return <td className="border border-gray-300 px-2 py-1">{children}</td>;
    },
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mb-3 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}
    >
      <div className={`flex items-start gap-2 max-w-[92%] sm:max-w-[85%] lg:max-w-[75%]`}>
        {/* Avatar for assistant */}
        {!isUser && (
          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </div>
        )}
        
        <div className={`relative flex-1 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm ${
          isUser 
            ? 'bg-emerald-600 text-white' 
            : 'bg-white text-gray-800 border border-gray-100'
        }`}>
          {/* Message content with Markdown support */}
          <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-emerald'}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {content}
            </ReactMarkdown>
          </div>
          
          {/* Time */}
          {timestamp && (
            <div className={`text-[10px] mt-1 text-right ${
              isUser ? 'text-emerald-200' : 'text-gray-400'
            }`}>
              {formattedTime}
            </div>
          )}
        </div>
        
        {/* Avatar for user */}
        {isUser && (
          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-sm mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
} 