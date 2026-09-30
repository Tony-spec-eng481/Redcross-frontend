import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const fetchMessages = () => {
    axios.get('http://localhost:5000/api/messages/1').then(res => setMessages(res.data));
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/messages', { text });
    setText('');
    fetchMessages();
  };

  return (
    <div className="portal-page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <h2>Community Chat</h2>
      <div style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '1rem', overflowY: 'auto', border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: '1rem', background: '#f3f4f6', padding: '0.5rem 1rem', borderRadius: '16px', display: 'inline-block', maxWidth: '80%' }}>
            {msg.text}
          </div>
        ))}
        {messages.length === 0 && <p style={{color:'#9ca3af'}}>No messages yet...</p>}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
        <input value={text} onChange={e => setText(e.target.value)} style={{ flex: 1, padding: '0.75rem', borderRadius: '24px', border: '1px solid #ccc' }} placeholder="Type a message..." required />
        <button type="submit" className="button button-red" style={{ borderRadius: '24px' }}>Send</button>
      </form>
    </div>
  );
}