import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BACKEND_URL, API_BASE } from '../../config';
import './Messages.css';

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
  const [filter, setFilter] = useState('all'); // 'all', 'direct', 'broadcast', 'unread'
  const [feedback, setFeedback] = useState('');

  // Members Directory Modal state
  const [showDirectory, setShowDirectory] = useState(false);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [directorySearch, setDirectorySearch] = useState('');
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  // Broadcast Modal state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

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
      .get(`${BACKEND_URL}/api/v1/messages`)
      .then((res) => {
        const fetched = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setMessages(fetched);
      })
      .catch(() => {
        axios.get(`${BACKEND_URL}/api/messages`)
          .then((res2) => {
            const fetched = Array.isArray(res2.data) ? res2.data : (res2.data.data || []);
            setMessages(fetched);
          })
          .catch((err) => console.error('Failed to fetch messages:', err));
      })
      .finally(() => setLoading(false));
  };

  const fetchDirectory = () => {
    setLoadingDirectory(true);
    axios
      .get(`${BACKEND_URL}/api/v1/messages/users`)
      .then((res) => {
        if (res.data.success) {
          setDirectoryUsers(res.data.data || []);
        }
      })
      .catch(() => {
        axios.get(`${BACKEND_URL}/api/messages/users`)
          .then((res2) => {
            if (res2.data.success) {
              setDirectoryUsers(res2.data.data || []);
            }
          })
          .catch((err) => console.error('Failed to fetch directory:', err));
      })
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
        subject: `Direct Chat with ${user.name}`,
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

    // Mark unread messages in conversation as read locally
    const unreadMsgs = conv.messages?.filter(m => !m.is_read) || [];
    if (unreadMsgs.length > 0) {
      unreadMsgs.forEach(m => {
        axios.patch(`${BACKEND_URL}/api/v1/messages/${m.id}/read`).catch(() => {});
      });
      setMessages(prev => prev.map(m => unreadMsgs.some(u => u.id === m.id) ? { ...m, is_read: true } : m));
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

      let res;
      try {
        res = await axios.post(`${BACKEND_URL}/api/v1/messages`, payload);
      } catch {
        res = await axios.post(`${BACKEND_URL}/api/messages`, payload);
      }

      if (res?.data?.success || res?.status === 200 || res?.status === 201) {
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

  const handleSendBroadcast = async () => {
    if (!broadcastText.trim()) return;
    setSendingBroadcast(true);
    try {
      const payload = {
        text: broadcastText.trim(),
        subject: broadcastSubject.trim() || 'Member Chapter Announcement',
        sender_name: currentUser.name || 'Member',
        sender_email: currentUser.email || 'member@kyu.ac.ke',
        is_broadcast: true,
      };
      try {
        await axios.post(`${BACKEND_URL}/api/v1/messages`, payload);
      } catch {
        await axios.post(`${BACKEND_URL}/api/messages`, payload);
      }
      setShowBroadcastModal(false);
      setBroadcastText('');
      setBroadcastSubject('');
      fetchMessages();
      alert('Broadcast announcement dispatched successfully!');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to dispatch broadcast');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleDeleteConversation = async (conv, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Delete conversation with ${conv.partnerName}?`)) {
      try {
        const msgIds = conv.messages.map(m => m.id);
        for (const id of msgIds) {
          await axios.delete(`${BACKEND_URL}/api/v1/messages/${id}`).catch(() => {
            return axios.delete(`${BACKEND_URL}/api/messages/${id}`).catch(() => {});
          });
        }
        setMessages(prev => prev.filter(m => !msgIds.includes(m.id)));
        if (selectedConvId === conv.id) {
          setSelectedConvId(null);
        }
      } catch (err) {
        console.error(err);
      }
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
    if (filter === 'unread' && (c.is_read || c.unreadCount === 0)) return false;
    if (filter === 'broadcast' && !c.is_broadcast) return false;
    if (filter === 'direct' && c.is_broadcast) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.partnerName?.toLowerCase().includes(q) ||
      c.partnerEmail?.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    );
  });

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

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
          <h2>Messages & Communications</h2>
          <p>Unified conversation threads with live chat and automatic email notifications</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="button button-red"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            onClick={handleOpenDirectory}
          >
            <span>👥</span> Choose Member to Chat
          </button>
          <button
            className="button button-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            onClick={() => setShowBroadcastModal(true)}
          >
            <span>📢</span> New Broadcast
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <button
          className={filter === 'all' ? 'button button-red' : 'button button-outline'}
          style={{ padding: '6px 14px', fontSize: '13px' }}
          onClick={() => setFilter('all')}
        >
          All Chats ({conversations.length})
        </button>
        <button
          className={filter === 'direct' ? 'button button-red' : 'button button-outline'}
          style={{ padding: '6px 14px', fontSize: '13px' }}
          onClick={() => setFilter('direct')}
        >
          Direct & Inquiries ({conversations.filter(c => !c.is_broadcast).length})
        </button>
        <button
          className={filter === 'broadcast' ? 'button button-red' : 'button button-outline'}
          style={{ padding: '6px 14px', fontSize: '13px' }}
          onClick={() => setFilter('broadcast')}
        >
          Broadcasts ({conversations.filter(c => c.is_broadcast).length})
        </button>
        <button
          className={filter === 'unread' ? 'button button-red' : 'button button-outline'}
          style={{ padding: '6px 14px', fontSize: '13px' }}
          onClick={() => setFilter('unread')}
        >
          Unread ({totalUnread})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading conversations...</div>
      ) : allConversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📬</div>
          <h3>No Conversations Yet</h3>
          <p style={{ color: '#64748B', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Start a direct chat with any coordinator or member, or view broadcast announcements.
          </p>
          <button className="button button-red" onClick={handleOpenDirectory}>
            👥 Choose Member to Chat
          </button>
        </div>
      ) : (
        <div className="portal-messages-layout">
          {/* Left Side: Conversation list */}
          <div className="portal-conversations-card">
            <div className="conversations-header">
              <h3>Conversations</h3>
              {totalUnread > 0 && <span className="unread-count" style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>{totalUnread} unread</span>}
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
              {filteredConversations.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                  No chats matching your filter.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = activeConversation?.id === conv.id;
                  const hasUnread = conv.unreadCount > 0;

                  return (
                    <div
                      key={conv.id}
                      className={`conv-item ${isActive ? 'active' : ''} ${hasUnread ? 'unread' : ''}`}
                      onClick={() => handleSelectConversation(conv)}
                    >
                      <div className={`conv-avatar ${conv.is_broadcast ? 'broadcast' : ''}`}>
                        {conv.is_broadcast ? '📢' : getInitials(conv.partnerName)}
                      </div>
                      <div className="conv-info">
                        <div className="conv-top">
                          <span className="conv-name" style={{ fontWeight: hasUnread ? '800' : '600' }}>
                            {conv.partnerName}
                          </span>
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
                      {conv.unreadCount > 0 && (
                        <span style={{ background: '#dc2626', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' }}>
                          {conv.unreadCount}
                        </span>
                      )}
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
                      <h3 style={{ margin: 0, fontSize: '15px' }}>{activeConversation.is_broadcast ? 'Chapter Broadcast' : activeConversation.partnerName}</h3>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                        {activeConversation.partnerEmail ? `Email: ${activeConversation.partnerEmail} • ` : ''}
                        <strong>Topic:</strong> {activeConversation.subject || 'Direct Chat'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {activeConversation.partnerEmail && (
                      <a
                        href={`mailto:${activeConversation.partnerEmail}?subject=Re: ${encodeURIComponent(activeConversation.subject || 'Chat')} - Kenya Red Cross KyU`}
                        className="button button-outline"
                        style={{ padding: '5px 10px', fontSize: '12px', textDecoration: 'none' }}
                      >
                        ✉ External Email
                      </a>
                    )}
                    {!activeConversation.isDraft && (
                      <button
                        className="button button-outline"
                        style={{ padding: '5px 10px', fontSize: '12px', color: '#dc2626', borderColor: '#fca5a5' }}
                        onClick={(e) => handleDeleteConversation(activeConversation, e)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Chat Timeline */}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', marginBottom: '6px' }}>
                    <span>
                      💬 Chatting with <strong>{activeConversation.partnerName}</strong>
                    </span>
                    <span>Press Enter to send (Shift+Enter for new line)</span>
                  </div>
                  <form onSubmit={handleSend} className="chat-input-row">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={`Type a message to ${activeConversation.partnerName}... (sent to portal & via email)`}
                      rows={2}
                      disabled={sending}
                      style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none', resize: 'none' }}
                    />
                    <button type="submit" className="btn-send" disabled={sending || !text.trim()} style={{ height: 'auto', alignSelf: 'stretch' }}>
                      {sending ? 'Sending...' : 'Send'} <span>✈</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#9ca3af', padding: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
                  <h3>Select a Conversation</h3>
                  <p>Choose a chat from the left or click "Choose Member to Chat".</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="modal-overlay" onClick={() => setShowBroadcastModal(false)}>
          <div className="portal-directory-modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="directory-header">
              <h3>Dispatch Chapter Broadcast</h3>
              <button className="directory-close-btn" onClick={() => setShowBroadcastModal(false)}>
                ✕
              </button>
            </div>

            <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 16px 0' }}>
              Publish an announcement to the member portal message stream and dispatch email alerts to volunteers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>Announcement Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter Workshop & Drill Schedule"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>Message Content</label>
                <textarea
                  rows={5}
                  placeholder="Type your official announcement..."
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button className="button button-outline" onClick={() => setShowBroadcastModal(false)}>
                  Cancel
                </button>
                <button
                  className="button button-red"
                  onClick={handleSendBroadcast}
                  disabled={sendingBroadcast || !broadcastText.trim()}
                >
                  {sendingBroadcast ? 'Dispatching...' : 'Dispatch Announcement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}