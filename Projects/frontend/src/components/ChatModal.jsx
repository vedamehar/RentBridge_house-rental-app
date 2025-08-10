import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ChatModal = ({ owner, onClose }) => {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMsg = () => {
    if (msg.trim() === '') return;
    setMessages([...messages, { from: 'You', text: msg }]);
    setMsg('');
  };

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Chat with {owner?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: 300, overflowY: 'auto' }}>
        {messages.map((m, idx) => (
          <p key={idx}><strong>{m.from}:</strong> {m.text}</p>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Form.Control
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type your message..."
        />
        <Button variant="primary" onClick={sendMsg}>Send</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChatModal;
