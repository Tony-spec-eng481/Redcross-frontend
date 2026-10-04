import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Messages.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Helper to extract email from strings like "Jane Doe (jane@example.com)"
 */
function extractEmail(str) {
  if (!str) return null;
  const match = str.match(/\(([^)]+)\)/);
  if (match && match[1].includes('@')) return match[1].trim();
  const directMatch = str.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (directMatch) return directMatch[0].trim();
  return null;
}

/**
 * Group flat message records into single WhatsApp-style conversation threads
 */
function groupMessagesIntoConversations(messages, currentUserEmail) {
  const myEmail = (currentUserEmail || '').toLowerCase().trim();
  const convMap = new Map();

  // Sort chronologically oldest to newest
  const sorted = [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  for (const msg of sorted) {
    if (msg.is_broadcast) {
      const convKey = `broadcast-${msg.id}`;
      convMap.set(convKey, {
        id: convKey,
        is_broadcast: true,
        partnerName: 'Chapter Announcement',
        partnerEmail: null,
        subject: msg.subject || 'Official Announcement',
        lastMessage: msg.text,
        lastMessageTime: msg.created_at,
        is_read: msg.is_read !== false,
        unreadCount: msg.is_read === false ? 1 : 0,
        messages: [msg],
      });
      continue;
    }

    const sEmail = (msg.sender_email || extractEmail(msg.sender_name) || extractEmail(msg.text) || '').toLowerCase().trim();
    const rEmail = (msg.receiver_email || extractEmail(msg.receiver_name) || '').toLowerCase().trim();

    const isSentByMe = (myEmail && sEmail === myEmail) || msg.sender_name?.toLowerCase() === 'member user';

    let partnerEmail = '';
    let partnerName = '';

    if (isSentByMe) {
      partnerEmail = rEmail;
      partnerName = msg.receiver_name || (rEmail ? rEmail.split('@')[0] : 'Chapter Leader');
    } else {
      partnerEmail = sEmail;
      partnerName = msg.sender_name?.replace(/\([^)]*\)/g, '').trim() || 'Admin / Coordinator';
    }

    let convKey = '';
    if (partnerEmail) {
      convKey = `partner-${partnerEmail}`;
    } else if (partnerName) {
      convKey = `partner-${partnerName.toLowerCase()}`;
    } else {
      convKey = `msg-${msg.id}`;
    }

    if (convMap.has(convKey)) {
      const existing = convMap.get(convKey);
      existing.messages.push(msg);
      existing.lastMessage = msg.text;
      existing.lastMessageTime = msg.created_at;
      if (msg.subject && !existing.subject) {
        existing.subject = msg.subject;
      }
      if (!isSentByMe && msg.is_read === false) {
        existing.unreadCount = (existing.unreadCount || 0) + 1;
        existing.is_read = false;
      }
      if (!existing.partnerEmail && partnerEmail) {
        existing.partnerEmail = partnerEmail;
      }
      if ((!existing.partnerName || existing.partnerName === 'Member') && partnerName) {
        existing.partnerName = partnerName;
      }
    } else {
      convMap.set(convKey, {
        id: convKey,
        is_broadcast: false,
        partnerName: partnerName || 'Chapter Coordinator',
        partnerEmail: partnerEmail || null,
        subject: msg.subject || 'Direct Message',
        lastMessage: msg.text,
        lastMessageTime: msg.created_at,
        is_read: isSentByMe ? true : (msg.is_read !== false),
        unreadCount: (!isSentByMe && msg.is_read === false) ? 1 : 0,
        messages: [msg],
      });
    }
  }

  return Array.from(convMap.values()).sort(
    (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
  );
}

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [draftConversation, setDraftConversation] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState('');

  // Members Directory Modal state
  const [showDirectory, setShowDirectory] = useState(false);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [directorySearch, setDirectorySearch] = useState('');
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  const chatEndRef = useRef(null);

  // Get current logged-in member
  const currentUser = (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : { name: 'Member User', email: 'member@kyu.ac.ke' };
    } catch {
      return { name: 'Member User', email: 'member@kyu.ac.ke' };
    }
  })();

  const fetchMessages = () => {
    axios
      .get(`${BACKEND_URL}/api/messages`)
      .then((res) => {
        const fetched = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setMessages(fetched);
      })
      .catch((err) => console.error('Failed to fetch messages:', err))
      .finally(() => setLoading(false));
  };

  const fetchDirectory = () => {
    setLoadingDirectory(true);
    axios
      .get(`${BACKEND_URL}/api/messages/users`)
      .then((res) => {
        if (res.data.success) {
          setDirectoryUsers(res.data.data || []);
        }
      })
      .catch((err) => console.error('Failed to fetch directory:', err))
      .finally(() => setLoadingDirectory(false));
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 6000);
    return () => clearInterval(interval);
  }, []);

  // Compute grouped conversations
  const conversations = groupMessagesIntoConversations(messages, currentUser.email);

  const allConversations = draftConversation
    ? [draftConversation, ...conversations.filter(c => c.id !== draftConversation.id)]
    : conversations;

  // Auto-select first conversation if none chosen
  useEffect(() => {
    if (!selectedConvId && allConversations.length > 0) {
      setSelectedConvId(allConversations[0].id);
    }
  }, [allConversations.length]);

  const activeConversation =
    draftConversation && draftConversation.id === selectedConvId
      ? draftConversation
      : allConversations.find(c => c.id === selectedConvId) || allConversations[0] || null;

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConvId, activeConversation?.messages?.length, messages.length]);

  const handleOpenDirectory = () => {
    setShowDirectory(true);
    fetchDirectory();
  };

  const handleSelectUserFromDirectory = (user) => {
    setShowDirectory(false);
    const targetEmail = (user.email || '').toLowerCase().trim();
    const existingConv = conversations.find(
      c => c.partnerEmail && c.partnerEmail.toLowerCase() === targetEmail
    );

    if (existingConv) {
      setSelectedConvId(existingConv.id);
      setDraftConversation(null);
    } else {
      const newDraft = {
        id: `draft-${targetEmail || Date.now()}`,
        isDraft: true,
        partnerName: user.name,
        partnerEmail: user.email,
        subject: `Chat with ${user.name}`,
        lastMessage: 'Type your message below...',
        lastMessageTime: new Date().toISOString(),
        is_read: true,
        unreadCount: 0,
        messages: [],
      };
      setDraftConversation(newDraft);
      setSelectedConvId(newDraft.id);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConvId(conv.id);
    if (draftConversation && draftConversation.id !== conv.id) {
      setDraftConversation(null);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || !activeConversation) return;

    setSending(true);
    setFeedback('');

    const targetEmail = activeConversation.partnerEmail;
    const targetName = activeConversation.partnerName;
    const rootMessage = activeConversation.messages?.[0];

    try {
      const payload = {
        text: text.trim(),
        subject: activeConversation.subject ? `Re: ${activeConversation.subject.replace(/^Re:\s*/i, '')}` : 'Portal Chat',
        sender_name: currentUser.name || 'Member',
        sender_email: currentUser.email || 'member@kyu.ac.ke',
        receiver_name: targetName,
        receiver_email: targetEmail || undefined,
        reply_to_id: rootMessage?.id || undefined,
        is_broadcast: false,
      };

      const res = await axios.post(`${BACKEND_URL}/api/messages`, payload);

      if (res.data.success || res.status === 200 || res.status === 201) {
        setText('');
        setFeedback(
          targetEmail
            ? `✓ Message sent & email notification dispatched to ${targetEmail}`
            : '✓ Message posted to chat.'
        );
        setTimeout(() => setFeedback(''), 5000);

        if (activeConversation.isDraft) {
          setDraftConversation(null);
        }

        fetchMessages();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'RC';
    const clean = name.replace(/\([^)]*\)/g, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return clean.slice(0, 2).toUpperCase() || 'RC';
  };

  // Filter conversations
  const filteredConversations = allConversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.partnerName?.toLowerCase().includes(q) ||
      c.partnerEmail?.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    );
  });

  // Filter directory
  const filteredDirectory = directoryUsers.filter((u) => {
    if (!directorySearch.trim()) return true;
    const q = directorySearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="portal-messages-page">
      <div className="portal-messages-header">
        <div>
          <h2>Member Communications & Chat</h2>
          <p>Connect directly with chapter leaders, admins, and fellow volunteers</p>
        </div>
        <button
          className="button button-red"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          onClick={handleOpenDirectory}
        >
          <span>👥</span> Choose Member to Chat
        </button>
      </div>

      <div className="portal-messages-layout">
        {/* Left Side: WhatsApp-style single conversation list */}
        <div className="portal-conversations-card">
          <div className="conversations-header">
            <h3>Chats ({conversations.length})</h3>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
              onClick={handleOpenDirectory}
              title="New Chat / Member Directory"
            >
              ➕
            </button>
          </div>

          <div className="conversations-search">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="conversations-list">
            {loading ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af' }}>
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                No chats found. Click <strong>"Choose Member to Chat"</strong> to start a conversation!
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversation?.id === conv.id;

                return (
                  <div
                    key={conv.id}
                    className={`conv-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className={`conv-avatar ${conv.is_broadcast ? 'broadcast' : ''}`}>
                      {conv.is_broadcast ? '📢' : getInitials(conv.partnerName)}
                    </div>
                    <div className="conv-info">
                      <div className="conv-top">
                        <span className="conv-name">{conv.partnerName}</span>
                        <span className="conv-time">
                          {new Date(conv.lastMessageTime).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="conv-subject">
                        {conv.is_broadcast ? '📢 ' : ''}
                        {conv.subject}
                      </div>
                      <div className="conv-preview">{conv.lastMessage}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="portal-chat-card">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="chat-header">
                <div className="chat-partner-info">
                  <div className={`conv-avatar ${activeConversation.is_broadcast ? 'broadcast' : ''}`}>
                    {activeConversation.is_broadcast ? '📢' : getInitials(activeConversation.partnerName)}
                  </div>
                  <div>
                    <h3>{activeConversation.is_broadcast ? 'Chapter Broadcast' : activeConversation.partnerName}</h3>
                    <p>
                      {activeConversation.partnerEmail ? `Email: ${activeConversation.partnerEmail}` : 'Red Cross Member'} •{' '}
                      {activeConversation.subject || 'Portal Chat'}
                    </p>
                  </div>
                </div>

                {activeConversation.partnerEmail && (
                  <a
                    href={`mailto:${activeConversation.partnerEmail}?subject=Re: ${encodeURIComponent(activeConversation.subject || 'Chat')} - Kenya Red Cross KyU`}
                    className="button button-outline"
                    style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}
                  >
                    ✉ External Email
                  </a>
                )}
              </div>

              {/* Chat Timeline (All messages in this conversation thread) */}
              <div className="chat-stream">
                {activeConversation.messages && activeConversation.messages.length > 0 ? (
                  activeConversation.messages.map((msg) => {
                    const myEmail = (currentUser.email || '').toLowerCase().trim();
                    const sEmail = (msg.sender_email || extractEmail(msg.sender_name) || '').toLowerCase().trim();
                    const isOutgoing =
                      (myEmail && sEmail === myEmail) ||
                      msg.sender_name === currentUser.name ||
                      msg.sender_name?.toLowerCase() === 'member user';

                    return (
                      <div
                        key={msg.id}
                        className={`chat-bubble-row ${isOutgoing ? 'outgoing' : 'incoming'}`}
                      >
                        <div className="chat-bubble">
                          <div style={{ fontSize: '11.5px', fontWeight: 'bold', marginBottom: '2px', opacity: 0.9 }}>
                            {isOutgoing ? 'You' : (msg.sender_name?.replace(/\([^)]*\)/g, '').trim() || 'Sender')}
                          </div>
                          <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                          <div className="chat-meta">
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {msg.receiver_email && (
                              <span style={{ fontSize: '10px', opacity: 0.85 }}>
                                • ✉ Emailed to {msg.receiver_email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 0' }}>
                    <p>Start your conversation with <strong>{activeConversation.partnerName}</strong> below.</p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="chat-input-area">
                {feedback && (
                  <div style={{ color: '#059669', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                    {feedback}
                  </div>
                )}
                <form onSubmit={handleSend} className="chat-input-row">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`Type a message to ${activeConversation.partnerName}... (sent to portal & via email)`}
                    disabled={sending}
                  />
                  <button type="submit" className="btn-send" disabled={sending || !text.trim()}>
                    {sending ? 'Sending...' : 'Send'} <span>✈</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#9ca3af', padding: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
                <h3>Start a Conversation</h3>
                <p>Click "Choose Member to Chat" to find coordinators and volunteers.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Members Directory Modal */}
      {showDirectory && (
        <div className="modal-overlay" onClick={() => setShowDirectory(false)}>
          <div className="portal-directory-modal" onClick={(e) => e.stopPropagation()}>
            <div className="directory-header">
              <h3>Chapter Member Directory</h3>
              <button className="directory-close-btn" onClick={() => setShowDirectory(false)}>
                ✕
              </button>
            </div>

            <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 12px 0' }}>
              Select any coordinator or member to start a direct chat with automatic email notification.
            </p>

            <input
              type="text"
              className="portal-directory-search"
              placeholder="Search by name, email, or role..."
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              autoFocus
            />

            {loadingDirectory ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                Loading chapter directory...
              </div>
            ) : filteredDirectory.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                No members found matching "{directorySearch}".
              </div>
            ) : (
              <div className="portal-directory-list">
                {filteredDirectory.map((user) => (
                  <div
                    key={`${user.type}-${user.id}`}
                    className="portal-directory-item"
                    onClick={() => handleSelectUserFromDirectory(user)}
                  >
                    <div className="portal-user-meta">
                      <div className={`conv-avatar ${user.type === 'admin' ? 'broadcast' : ''}`}>
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#111827', fontSize: '13.5px' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {user.email} {user.phone ? `• ${user.phone}` : ''}
                        </div>
                      </div>
                    </div>
                    <span className={`portal-role-tag ${user.type === 'admin' ? 'admin' : ''}`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}