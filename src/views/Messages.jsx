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
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef();

  // Initial fetch and handling redirected chat from applications page
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const { data: convos } = await api.get("/messages/conversations");

        setConversations(convos);
        
        // If navigated from elsewhere with a specific user to chat with
        const initialRecipientId = searchParams.get('recipientId');
        if (initialRecipientId) {
          const existing = convos.find(c => c.contact._id === initialRecipientId);
          if (existing) {
            setActiveChat(existing.contact);
          }
          // Note: If contact not in convo list, it could be fetched separately
        } else if (convos.length > 0) {
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

        setMessages(data);
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };
    fetchMessages();

    // Poll for new messages every 5 seconds (simplification for real-time without sockets)
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeChat]);

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    setSending(true);
    try {
      const { data } = await api.post("/messages", {
        receiverId: activeChat._id || activeChat.id,
        content: newMessage
      });

      setMessages(prev => [...prev, data]);
      setNewMessage("");
      
      // Update sidebar conversation preview
      setConversations(prev => {
        const existing = prev.find(c => c.contact._id === (activeChat._id || activeChat.id));
        if (existing) {
          return prev.map(c => c.contact._id === (activeChat._id || activeChat.id) 
            ? { ...c, lastMessage: data } 
            : c
          ).sort((a,b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
        }
        return [{ contact: activeChat, lastMessage: data, unreadCount: 0 }, ...prev];
      });
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading && conversations.length === 0) return <LoadingSpinner label="Opening secure gateway..." />;

  return (
    <div className={styles.container + " animate-fade-in"}>
      <div className={styles.wrapper}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className="text-gradient">Chats</h2>
            <div className={styles.searchBar}>
              <Search size={18} />
              <input type="text" placeholder="Search conversations..." />
            </div>
          </div>
          
          <div className={styles.conversationList}>
            {conversations.length === 0 ? (
              <div className={styles.sidebarEmpty}>
                <MessageSquare size={40} className={styles.emptyIcon} />
                <p>No conversations yet</p>
                <span>Reach out to candidates or recruiters from the pipeline to start chatting.</span>
              </div>
            ) : (
              conversations.map(convo => (
                <div 
                  key={convo.contact._id} 
                  className={`${styles.convoItem} ${activeChat?._id === convo.contact._id ? styles.active : ""}`}
                  onClick={() => setActiveChat(convo.contact)}
                >
                  <div className={styles.avatarWrapper}>
                    <img src={convo.contact.avatar} alt="" className={styles.avatar} />
                    <div className={styles.statusDot}></div>
                  </div>
                  <div className={styles.convoBody}>
                    <div className={styles.convoHeader}>
                      <span className={styles.convoName}>{convo.contact.fname} {convo.contact.lname}</span>
                      <span className={styles.convoTime}>
                        {convo.lastMessage ? format(new Date(convo.lastMessage.createdAt), "HH:mm") : ""}
                      </span>
                    </div>
                    <div className={styles.convoPreview}>
                      <p>{convo.lastMessage?.content}</p>
                      {convo.unreadCount > 0 && <span className={styles.unreadCount}>{convo.unreadCount}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className={styles.chatArea}>
          {activeChat ? (
            <>
              <header className={styles.chatHeader}>
                <div className={styles.activeContact}>
                  <img src={activeChat.avatar} alt="" className={styles.avatarSm} />
                  <div>
                    <h4>{activeChat.fname} {activeChat.lname}</h4>
                    <span>{activeChat.role === 'candidate' ? 'Candidate' : 'Recruitment Team'}</span>
                  </div>
                </div>
                <div className={styles.headerActions}>
                  <Button variant="ghost" size="sm"><Phone size={18} /></Button>
                  <Button variant="ghost" size="sm"><Video size={18} /></Button>
                  <Button variant="ghost" size="sm"><Info size={18} /></Button>
                </div>
              </header>

              <div className={styles.messageHistory}>
                {messages.length === 0 ? (
                  <div className={styles.chatStart}>
                    <User size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                    <p>Start your conversation with {activeChat.fname}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Messages are end-to-end encrypted</span>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isOwn = msg.senderId === currentUser._id;
                    return (
                      <div key={msg._id || i} className={`${styles.messageWrapper} ${isOwn ? styles.ownMessage : ""}`}>
                        <div className={styles.messageBubble}>
                          <p>{msg.content}</p>
                          <span className={styles.messageTime}>
                            {format(new Date(msg.createdAt), "HH:mm")}
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
                    placeholder="Type your message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <Button type="submit" disabled={!newMessage.trim() || sending} className={styles.sendBtn}>
                    <Send size={18} />
                  </Button>
                </form>
              </footer>
            </>
          ) : (
            <div className={styles.noChat}>
              <div className={styles.noChatContent}>
                 <div className={styles.noChatIconWrapper}>
                    <MessageSquare size={48} />
                 </div>
                 <h3>TalentFlow Messenger</h3>
                 <p>Select a candidate or recruiter from your list to begin a professional recruitment conversation.</p>
                 <span className={styles.encryptionNotice}>
                    <ShieldAlert size={12} /> Messages are secure and private
                 </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
