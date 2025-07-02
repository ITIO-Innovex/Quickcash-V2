import { useRef, useState } from 'react';
import PageHeader from '@/components/common/pageHeader';
import { Box, Avatar, Typography, IconButton, useTheme } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';

type Message = {
  sender: string;
  text: string;
  time: string;
  image?: string | null;
};

const initialMessages: Message[] = [
  { sender: 'A', text: 'Hi', time: '2024-09-09 04:22:06 PM' },
  { sender: 'A', text: '...', time: '2024-09-09 04:22:49 PM' },
  { sender: 'U', text: 'Hello', time: '2024-09-09 04:21:55 PM' },
  { sender: 'U', text: 'Hello Sir', time: '2024-11-18 05:17:37 PM' },
  { sender: 'U', text: 'Hii', time: '2024-11-18 05:22:26 PM' },
  { sender: 'U', text: 'Good Evening', time: '2024-11-18 05:23:00 PM' },
];

const ChatHistory = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSend = () => {
    if (!input && !image) return;
    const newMsg = {
      sender: 'U',
      text: input,
      time: new Date().toLocaleString('en-GB', { hour12: true }),
      image: image,
    };
    setMessages([...messages, newMsg]);
    setInput('');
    setImage(null);
  };

  const handleAttach = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target.result === 'string') {
          setImage(ev.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  return (
    <Box className="chat-history-root">
      <PageHeader title="Chat History (Itau)" />
      <Box className="chat-history-container">
        {messages.map((msg, idx) => {
          const isAgent = msg.sender === 'A';
          return (
            <Box key={idx} className={`chat-message-row ${isAgent ? 'agent' : 'user'}`}>
              <Avatar className="chat-avatar">{isAgent ? 'A' : 'U'}</Avatar>
              <Box className={`chat-message-content ${isAgent ? 'agent' : 'user'}`}>
                <Box className={`chat-bubble ${isAgent ? 'agent' : 'user'}`}>
                  {msg.text && (
                    <Typography variant="body1" className='msg-input'>
                      {msg.text}
                    </Typography>
                  )}
                  {msg.image && (
                    <img src={msg.image} alt="attachment" className="chat-image" />
                  )}
                  {!msg.text && !msg.image && (
                    <span style={{ opacity: 0 }}>_</span>
                  )}
                </Box>
                <Typography variant="caption" className="chat-time">
                  {msg.time}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box className="chat-input-bar">
        <input
          type="text"
          className="chat-input"
          placeholder="Enter Message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleAttach}
        />
        <IconButton className="chat-attach-btn" onClick={() => fileInputRef.current.click()}>
          <AttachFileIcon />
        </IconButton>
        <IconButton className="chat-send-btn" onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatHistory;