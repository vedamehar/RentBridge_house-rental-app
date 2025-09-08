import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, ListGroup, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ChatModal = ({ owner, onClose, propertyId }) => {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (owner?._id) {
      fetchMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [owner?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
  `${import.meta.env.VITE_API_URL}/api/messages/conversation/${owner._id}`,
        { withCredentials: true }
      );
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMsg = async (e) => {
    e?.preventDefault();
    if (msg.trim() === '' || sending) return;

    setSending(true);
    try {
      await axios.post(
  `${import.meta.env.VITE_API_URL}/api/messages`,
        {
          receiverId: owner._id,
          content: msg.trim(),
          propertyId: propertyId
        },
        { withCredentials: true }
      );
      setMsg('');
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
  };

  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chat with {owner?.name || 'Owner'}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
          {loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted py-3">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <ListGroup variant="flush">
              {messages.map((message, idx) => {
                const isFromCurrentUser = message.senderId._id === currentUser?._id || message.senderId === currentUser?._id;
                return (
                  <ListGroup.Item 
                    key={message._id || idx} 
                    className={`border-0 ${isFromCurrentUser ? 'text-end' : ''}`}
                  >
                    <div className={`d-inline-block p-2 rounded ${
                      isFromCurrentUser 
                        ? 'bg-primary text-white' 
                        : 'bg-light'
                    }`} style={{ maxWidth: '70%' }}>
                      <div>{message.content}</div>
                      <small className={`d-block mt-1 ${isFromCurrentUser ? 'text-light' : 'text-muted'}`}>
                        {message.senderName} • {new Date(message.createdAt).toLocaleTimeString()}
                      </small>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
          <div ref={messagesEndRef} />
        </div>
        <Form onSubmit={sendMsg} className="d-flex gap-2">
          <Form.Control
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={sending}
            style={{ flex: 1 }}
          />
          <Button 
            variant="primary" 
            onClick={sendMsg}
            disabled={sending || msg.trim() === ''}
          >
            {sending ? <Spinner animation="border" size="sm" /> : 'Send'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChatModal;
