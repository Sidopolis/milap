import React, { useState, useRef, useEffect } from 'react';
import { db } from '../firebase';
import {
  ref,
  push,
  onChildAdded,
  onValue,
  set,
  remove,
  serverTimestamp,
} from 'firebase/database';

const CHAT_ROOM = 'global_chat/messages';
const PRESENCE = 'global_chat/online';

const FloatingChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ user: string; text: string; time: number }[]>([]);
  const [users, setUsers] = useState<{ name: string; id: string }[]>([]);
  const [userId, setUserId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Generate a unique user ID for presence
  useEffect(() => {
    if (!userId) {
      setUserId(Math.random().toString(36).slice(2));
    }
  }, [userId]);

  // Listen for messages
  useEffect(() => {
    if (!open) return;
    const chatRef = ref(db, CHAT_ROOM);
    setMessages([]); // clear before listening
    const handleNewMsg = onChildAdded(chatRef, (snapshot) => {
      const val = snapshot.val();
      setMessages((prev) => [...prev, val]);
    });
    return () => handleNewMsg();
  }, [open]);

  // Listen for online users
  useEffect(() => {
    if (!open) return;
    const presenceRef = ref(db, PRESENCE);
    const unsub = onValue(presenceRef, (snapshot) => {
      const val = snapshot.val() || {};
      setUsers(
        Object.entries(val).map(([id, v]: any) => ({ name: v.name, id }))
      );
    });
    return () => unsub();
  }, [open]);

  // Add/remove self to presence
  useEffect(() => {
    if (!open || !name || !userId) return;
    const userRef = ref(db, `${PRESENCE}/${userId}`);
    set(userRef, { name });
    const onDisconnectRef = () => remove(userRef);
    window.addEventListener('beforeunload', onDisconnectRef);
    return () => {
      remove(userRef);
      window.removeEventListener('beforeunload', onDisconnectRef);
    };
  }, [open, name, userId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Autofocus name input when chat opens and name is not set
  useEffect(() => {
    if (open && !name && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [open, name]);

  // Autofocus message input when name is set
  useEffect(() => {
    if (open && name && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [open, name]);

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && nameInputRef.current) {
      e.preventDefault();
      if (nameInput.trim()) {
        setName(nameInput.trim());
        setNameInput('');
      }
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    push(ref(db, CHAT_ROOM), {
      user: name,
      text: message,
      time: Date.now(),
    });
    setMessage('');
  };

  return (
    <>
      {/* Floating Chat Icon/Badge */}
      <button
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-black/90 text-white rounded-full shadow-xl px-5 py-3 hover:bg-white hover:text-black transition-colors duration-200 border border-gray-800"
        style={{ minWidth: 56 }}
        onClick={() => setOpen(o => !o)}
        aria-label="Open chat"
      >
        <span className="text-2xl">💬</span>
        <span className="text-base font-semibold">{users.length}</span>
      </button>

      {/* Chat Bar */}
      {open && (
        <div className="fixed bottom-24 right-8 z-50 w-80 h-96 bg-black/95 rounded-2xl shadow-2xl border border-gray-800 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">Global Chat</span>
              <span className="ml-2 text-xs text-gray-400">{users.length} online</span>
            </div>
            <button
              className="text-gray-400 hover:text-white text-xl px-2"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          {/* Online Users */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 overflow-x-auto">
            {users.map((u, i) => (
              <div
                key={u.id}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border border-gray-700 shadow-sm bg-gray-700 text-white relative`}
                title={u.name}
              >
                {u.name[0]}
                {u.id === userId && (
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-cyan-300 font-semibold">You</span>
                )}
              </div>
            ))}
          </div>
          {/* Messages */}
          <div className="flex-1 px-4 py-2 overflow-y-auto text-sm space-y-2">
            {messages.map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-semibold text-white min-w-[40px]">{m.user}:</span>
                <span className="text-gray-200 break-words">{m.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-800 flex gap-2 bg-black/80">
            {!name ? (
              <input
                type="text"
                placeholder="Your name"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={handleNameKeyDown}
                className="bg-transparent border-b border-gray-700 focus:border-white text-white py-1 px-2 outline-none transition-colors duration-200 placeholder-gray-400 w-24"
                autoComplete="off"
                required
                ref={nameInputRef}
              />
            ) : (
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="bg-transparent border-b border-gray-700 focus:border-white text-white py-1 px-2 outline-none transition-colors duration-200 placeholder-gray-400 flex-1"
                autoComplete="off"
                required
                ref={messageInputRef}
              />
            )}
            <button
              type="submit"
              className="bg-white text-black font-semibold rounded-lg px-4 py-1 shadow transition-colors duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              disabled={!name || (!message.trim() && !!name)}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingChat; 