import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Container,
  Card,
  Form,
  Button,
  ListGroup
} from 'react-bootstrap';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { ownerId } = useParams();
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [ownerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
<<<<<<< HEAD
        `${import.meta.env.VITE_API_URL}/api/messages/${ownerId}`,
=======
        `http://localhost:5000/api/messages/${ownerId}`,
>>>>>>> 69aa8fb055145eb56359cfc64047ad1d71e52589
        { withCredentials: true }
      );
      setMessages(response.data.messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(
<<<<<<< HEAD
        `${import.meta.env.VITE_API_URL}/api/messages/${ownerId}`,
=======
        `http://localhost:5000/api/messages/${ownerId}`,
>>>>>>> 69aa8fb055145eb56359cfc64047ad1d71e52589
        { content: newMessage },
        { withCredentials: true }
      );
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <Container className="py-4">
      <Card>
        <Card.Header>Chat</Card.Header>
        <Card.Body>
          <ListGroup className="mb-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {messages.map((message) => (
              <ListGroup.Item
                key={message._id}
                className={`d-flex ${message.sender === currentUser._id ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div className={`message ${message.sender === currentUser._id ? 'sent' : 'received'}`}>
                  <div className="message-content">{message.content}</div>
                  <small className="text-muted">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </small>
                </div>
              </ListGroup.Item>
            ))}
            <div ref={messagesEndRef} />
          </ListGroup>
          
          <Form onSubmit={sendMessage}>
            <Form.Group className="d-flex">
              <Form.Control
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="me-2"
              />
              <Button type="submit" variant="primary">Send</Button>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Chat;