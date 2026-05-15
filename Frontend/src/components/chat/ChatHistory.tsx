import React from 'react';
import type { ChatMessage } from '../../types/chat';
import ChatMessageComp from './ChatMessage';

const ChatHistory: React.FC<{
  history: ChatMessage[];
  retry: (msgIndex: number) => void;
}> = ({ history, retry }) => (
  <div className="flex flex-col gap-3 py-2">
    {history.map((msg, idx) => (
      <ChatMessageComp key={msg.id} msg={msg} idx={idx} retry={retry} />
    ))}
  </div>
);
export default ChatHistory;
