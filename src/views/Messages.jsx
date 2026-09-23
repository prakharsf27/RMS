'use client';
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Send, Search, User, Phone, Video, Info, MessageSquare, ShieldAlert } from "lucide-react";
import styles from "./Messages.module.css";
import { format } from "date-fns";

export default function Messages() {
  const { user: currentUser } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef();

  // Initial fetch and handling redirected chat from applications page
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const { data: convos } = await api.get("/messages/conversations");
        setConversations(convos || []);
        
        // If navigated from elsewhere with a specific user to chat with
        const initialRecipientId = searchParams.get('recipientId');
        if (initialRecipientId) {
          const existing = (convos || []).find(c => c.contact?._id === initialRecipientId);
          if (existing) {
            setActiveChat(existing.contact);
          } else {
            // Fetch contact info if not in conversations
            try {
              const { data: contact } = await api.get(`/auth/users/${initialRecipientId}`);
              setActiveChat(contact);
            } catch (err) {
              console.error("Fetch contact error:", err);
            }
          }
        } else if (convos && convos.length > 0) {
          setActiveChat(convos[0].contact);
        }
      } catch (err) {
        console.error("Chat init error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [searchParams]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (!activeChat?._id && !activeChat?.id) return;
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/messages/${activeChat._id || activeChat.id}`);
        setMessages(data || []);
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };
    fetchMessages();

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeChat]);

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    setSending(true);
    try {
      const { data } = await api.post("/messages", {
        receiverId: activeChat._id || activeChat.id,
        content: newMessage.trim()
      });

      setMessages(prev => [...prev, data]);
      setNewMessage("");
      
      // Update sidebar conversation preview
      setConversations(prev => {
        const existing = prev.find(c => c.contact?._id === (activeChat._id || activeChat.id));
        if (existing) {
          return prev.map(c => c.contact?._id === (activeChat._id || activeChat.id) 
            ? { ...c, lastMessage: data } 
            : c
          ).sort((a,b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0));
        }
        return [{ contact: activeChat, lastMessage: data, unreadCount: 0 }, ...prev];
      });
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  // Filter conversations
  const filteredConversations = (() => {
    let list = [...conversations];
    if (activeChat && !list.find(c => c.contact?._id === activeChat._id)) {
      list = [{ contact: activeChat, lastMessage: null, unreadCount: 0 }, ...list];
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(c => {
      const name = `${c.contact?.fname || ''} ${c.contact?.lname || ''}`.toLowerCase();
      const content = (c.lastMessage?.content || '').toLowerCase();
      return name.includes(q) || content.includes(q);
    });
  })();

  if (loading && conversations.length === 0) return <LoadingSpinner label="Opening secure messaging channel..." />;

  return (
    <div className={styles.container + " animate-fade-in"}>
      <div className={styles.wrapper}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Conversations</h2>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', background: 'var(--bg-elevated-hover)', padding: '2px 8px', borderRadius: '12px' }}>
                {conversations.length} active
              </span>
            </div>
            <div className={styles.searchBar}>
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search candidates or messages..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className={styles.conversationList}>
            {filteredConversations.length === 0 ? (
              <div className={styles.sidebarEmpty}>
                <MessageSquare size={36} className={styles.emptyIcon} />
                <p>No conversations found</p>
                <span>{searchQuery ? "Try a different search term" : "Conversations with applicants and recruiters will appear here."}</span>
              </div>
            ) : (
              filteredConversations.map(convo => {
                const isSelected = activeChat?._id === convo.contact?._id;
                const contact = convo.contact || {};
                const fullName = `${contact.fname || 'Applicant'} ${contact.lname || ''}`.trim();
                const avatarUrl = contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0f172a&color=fff`;
                
                return (
                  <div 
                    key={contact._id || Math.random()} 
                    className={`${styles.convoItem} ${isSelected ? styles.active : ""}`}
                    onClick={() => setActiveChat(contact)}
                  >
                    <div className={styles.avatarWrapper}>
                      <img src={avatarUrl} alt={fullName} className={styles.avatar} />
                      <div className={styles.statusDot}></div>
                    </div>
                    <div className={styles.convoBody}>
                      <div className={styles.convoHeader}>
                        <span className={styles.convoName}>{fullName}</span>
                        <span className={styles.convoTime}>
                          {convo.lastMessage?.createdAt ? format(new Date(convo.lastMessage.createdAt), "HH:mm") : ""}
                        </span>
                      </div>
                      <div className={styles.convoPreview}>
                        <p>{convo.lastMessage?.content || "Conversation started"}</p>
                        {convo.unreadCount > 0 && <span className={styles.unreadCount}>{convo.unreadCount}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className={styles.chatArea}>
          {activeChat ? (
            <>
              <header className={styles.chatHeader}>
                <div className={styles.activeContact}>
                  <img 
                    src={activeChat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${activeChat.fname || ''} ${activeChat.lname || ''}`)}&background=0f172a&color=fff`} 
                    alt="" 
                    className={styles.avatarSm} 
                  />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                      {activeChat.fname} {activeChat.lname}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {activeChat.role === 'candidate' ? 'Candidate' : 'Recruitment Team'} • TalentFlow Enterprise Network
                    </span>
                  </div>
                </div>
                <div className={styles.headerActions}>
                  <Button variant="ghost" size="sm" title="Audio call placeholder"><Phone size={16} /></Button>
                  <Button variant="ghost" size="sm" title="Video room placeholder"><Video size={16} /></Button>
                  <Button variant="ghost" size="sm" title="Contact information"><Info size={16} /></Button>
                </div>
              </header>

              <div className={styles.messageHistory}>
                {messages.length === 0 ? (
                  <div className={styles.chatStart}>
                    <User size={40} style={{ opacity: 0.15, marginBottom: '0.75rem' }} />
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      Start your conversation with {activeChat.fname}
                    </p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      Direct messages are encrypted and archived for compliant audit logging.
                    </span>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isOwn = msg.senderId === currentUser?._id;
                    return (
                      <div key={msg._id || i} className={`${styles.messageWrapper} ${isOwn ? styles.ownMessage : ""}`}>
                        <div className={styles.messageBubble}>
                          <p>{msg.content}</p>
                          <span className={styles.messageTime}>
                            {msg.createdAt ? format(new Date(msg.createdAt), "HH:mm") : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={scrollRef} />
              </div>

              <footer className={styles.chatInputArea}>
                <form onSubmit={handleSendMessage} className={styles.inputContainer}>
                  <input 
                    type="text" 
                    placeholder={`Message ${activeChat.fname || 'contact'}...`} 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <Button type="submit" disabled={!newMessage.trim() || sending} className={styles.sendBtn} variant="primary">
                    <Send size={16} />
                  </Button>
                </form>
              </footer>
            </>
          ) : (
            <div className={styles.noChat}>
              <div className={styles.noChatContent}>
                 <div className={styles.noChatIconWrapper}>
                    <MessageSquare size={36} />
                 </div>
                 <h3>Recruitment Inbox</h3>
                 <p>Select a candidate or hiring team member from the sidebar to view their message history.</p>
                 <span className={styles.encryptionNotice}>
                    <ShieldAlert size={14} /> End-to-end encrypted recruitment channel
                 </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
