'use client';

import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '@/types/jarvis';

interface ChatMessageProps {
  message: ChatMessage;
}

export default function ChatMessageBubble({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="my-2 text-center text-xs text-cyan-400/60">
        {message.content}
      </div>
    );
  }

  return (
    <div className={`my-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant avatar */}
      {!isUser && (
        <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
            <circle cx="12" cy="17" r="1" />
          </svg>
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-cyan-500/15 text-cyan-50 border border-cyan-500/20'
            : 'bg-white/5 text-gray-200 border border-white/10'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-cyan-300 prose-a:text-cyan-400 prose-strong:text-cyan-200 prose-code:text-cyan-300">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        <div className={`mt-1 text-[10px] ${isUser ? 'text-cyan-400/40' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {message.type && message.type !== 'text' && (
            <span className="ml-2 uppercase">[{message.type}]</span>
          )}
        </div>
      </div>
    </div>
  );
}
