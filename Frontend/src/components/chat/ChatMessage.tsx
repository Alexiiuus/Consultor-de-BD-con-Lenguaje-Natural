import React from 'react';
import type { ChatMessage } from '../../types/chat';
import ChatSqlBlock from './ChatSqlBlock';
import ChatResultPreview from './ChatResultPreview';
import ErrorMessage from '../ErrorMessage';
import LoadingState from '../LoadingState';

const AVATAR_USER = (
  <span className="rounded-full bg-accent text-white w-7 h-7 inline-flex items-center justify-center font-bold mr-2">🧑</span>
);
const AVATAR_BOT = (
  <span className="rounded-full bg-slate-800 dark:bg-white text-white dark:text-black w-7 h-7 inline-flex items-center justify-center font-bold mr-2">🤖</span>
);

const ChatMessageComp: React.FC<{
  msg: ChatMessage;
  idx: number;
  retry: (idx: number) => void;
}> = ({ msg, idx, retry }) => {
  if (msg.role === 'user') {
    return (
      <div className="flex items-start justify-end"><div className="flex gap-2 items-center flex-row-reverse max-w-[66%] ml-auto">
        {AVATAR_USER}
        <div className="bg-accent text-white px-3 py-2 rounded-xl rounded-tr-md shadow-sm">{msg.content}</div>
      </div></div>
    );
  }
  // assistant
  return (
    <div className="flex items-start">
      {AVATAR_BOT}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 dark:bg-neutral-800 px-3 py-2 rounded-xl rounded-tl-md shadow-sm mb-1">
          {msg.status === 'pending' && <LoadingState text="Pensando..." />}
          {msg.status === 'success' && (
            <div>
              {msg.content && <div className="mb-1 whitespace-pre-line">{msg.content}</div>}
              {msg.sql && <ChatSqlBlock sql={msg.sql} />}
              <ChatResultPreview columns={msg.columns} rows={msg.rows} />
            </div>
          )}
          {msg.status === 'error' && <div><ErrorMessage>{msg.error || 'Ocurrió un error'}</ErrorMessage><button className="text-xs text-blue-500 underline mt-1" onClick={() => retry(idx-1)}>Reintentar</button></div>}
        </div>
      </div>
    </div>
  );
};
export default ChatMessageComp;
