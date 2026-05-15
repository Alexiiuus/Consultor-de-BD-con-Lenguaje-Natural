import React, { useState } from 'react';

const ChatInput: React.FC<{
  disabled?: boolean;
  onSend: (q: string) => void;
}> = ({ disabled, onSend }) => {
  const [value, setValue] = useState('');
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
    }
  };
  return (
    <form className="flex gap-2" onSubmit={handleSend}>
      <input
        className="flex-1 rounded border px-2 py-1 bg-white dark:bg-neutral-800" 
        placeholder="Preguntá algo sobre el dataset activo..." 
        value={value}
        onChange={e => setValue(e.target.value)}
        disabled={disabled}
        autoFocus
      />
      <button type="submit" disabled={disabled || !value.trim()} className="rounded bg-accent text-white px-4 py-1 font-semibold disabled:opacity-30">
        Enviar
      </button>
    </form>
  );
};
export default ChatInput;
