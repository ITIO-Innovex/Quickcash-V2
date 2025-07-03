import { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '@/components/common/pageHeader';
import { Box, Avatar, Typography, IconButton, useTheme, Grid, TextField, Button } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import moment from 'moment';
import admin from '@/helpers/adminApiHelper';

// type Message = {
//   sender: string;
//   text: string;
//   time: string;
//   image?: string | null;
// };

const ChatHistory = () => {
  const location = useLocation();
  const { ticketId, ticketIdAlt, userId } = location.state || {};
  const theme = useTheme();
  const [history, setHistory] = useState<any[]>([]); // chat array from API
  const [message, setMessage] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState<{ preview: string; raw: File | null }>({ preview: '', raw: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

  // Fetch chat history from API - using the working logic from chathistoryD.tsx
  const fetchChatHistory = async () => {
    if (!ticketId && !ticketIdAlt) {
      setError('No ticket ID provided');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Try both ticket IDs
    const ticketIdsToTry = [ticketId, ticketIdAlt].filter(Boolean);
    
    for (const currentTicketId of ticketIdsToTry) {
      try {
        let res;
        try {
          res = await admin.get(`/${url}/v1/support/adminlist/${currentTicketId}`);
        } catch (error) {
          res = await admin.get(`/${url}/v1/support/list/${currentTicketId}`);
          console.log('API Response (list):', res.data);
        }
        
        if (res.data.status === 201) {
          const chatData = res.data.data;
          setHistory(chatData);
          setLoading(false);
          return; 
        } else {
          console.error('API returned non-success status:', res.data.status);
        }
      } catch (error) {
        console.error(`Error fetching chat history for ticketId ${currentTicketId}:`, error);
      
      }
    }
    
    setError('Failed to load chat history. Please try again.');
    setLoading(false);
  };

  useEffect(() => {
    if (ticketId || ticketIdAlt) {
      fetchChatHistory();
    } else {
      console.log('No ticketId provided, not fetching chat history');
    }
    // eslint-disable-next-line
  }, [ticketId, ticketIdAlt]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

    // Handle sending message - using the working logic from chathistoryD.tsx
  const handleSend = async () => {
    if (!message && !attachmentPreview.raw) return;
    
    // Use the ticket ID that worked for fetching
    const currentTicketId = ticketId || ticketIdAlt;
    if (!currentTicketId) {
      setError('No ticket ID available for sending message');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('support', currentTicketId);
      formData.append('user', userId || '');
      formData.append('message', message);
      formData.append('from', 'Admin');
      formData.append('to', 'User');
      if (attachmentPreview.raw) {
        formData.append('attachment', attachmentPreview.raw);
      }
      
      await admin.post(`/${url}/v1/support/admin-replyticket`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          
        }
      });
      
      setMessage('');
      setAttachmentPreview({ preview: '', raw: null });
      fetchChatHistory(); 
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  // Handle file attachment
  const handleAttach = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxAllowedSize = 5 * 1024 * 1024;
      if (file.size > maxAllowedSize) {
        alert('Maximum 5mb size attachment are allowed to share');
        e.target.value = '';
        return;
      }
      setAttachmentPreview({
        preview: URL.createObjectURL(file),
        raw: file
      });
      setMessage(file.name + ' Attachment');
    }
    e.target.value = '';
  };

  // Helper to render attachments
  const renderAttachment = (attachment, message) => {
    if (!attachment) return null;
    if (attachment.includes('pdf')) {
      return <img src={`${import.meta.env.VITE_APP_URL}/pdf.png`} alt={message} height="100" width="100" />;
    }
    if (attachment.includes('doc')) {
      return <img src={`${import.meta.env.VITE_APP_URL}/docx.png`} alt={message} height="100" width="100" />;
    }
    if (attachment.includes('xlsx')) {
      return <img src={`${import.meta.env.VITE_APP_URL}/xls.jpg`} alt={message} height="100" width="100" />;
    }
    // Default: show as image
    return (
      <img
        src={`${import.meta.env.VITE_PUBLIC_URL}/${attachment}`}
        alt={message}
        height="200"
        width="200"
        onError={({ currentTarget }) => {
          currentTarget.onerror = null;
          currentTarget.src = `${import.meta.env.VITE_APP_URL}/otherdocs.png`;
        }}
      />
    );
  };

  if (!ticketId) {
    return <Box sx={{ p: 4, color: 'red' }}>No ticket selected. Please go back and select a ticket.</Box>;
  }

  return (
    <Box className="chat-history-root" sx={{ p: 2 }}>
      <PageHeader title="Chat History" />
      
      {error && (
        <Box sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}
      
      {loading && (
        <Box sx={{ p: 2, mb: 2, textAlign: 'center' }}>
          <Typography variant="body2">Loading chat history...</Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid silver', p: 2, borderRadius: 2, height: 410, overflowY: 'scroll', background: theme.palette.background.paper }}>
          {history.length === 0 && !loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                No chat messages found for this ticket.
              </Typography>
            </Box>
          ) : (
            history?.[0]?.chat?.map((item, index) => {
              const isAdmin = item.from === 'Admin';
              return isAdmin ? (
                <Grid container key={index} sx={{ flexDirection: 'row', gap: 1, alignItems: 'flex-start' }}>
                  <Avatar>A</Avatar>
                  <Box>
                    <Box sx={{ border: '1px solid #7269ef', color: 'white', background: '#7269ef', p: 1, borderRadius: 2, mb: 0.5 }}>
                      {item.attachment ? (
                        <>
                          {renderAttachment(item.attachment, item.message)}
                          <Box>
                            <a target='_blank' rel='noopener noreferrer' href={`${import.meta.env.VITE_PUBLIC_URL}/${item.attachment}`} style={{ textDecoration: 'none', color: 'white', background: 'purple', cursor: 'pointer', padding: '8px 12px', borderRadius: 4 }}>View</a>
                          </Box>
                        </>
                      ) : (
                        item.message
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {moment(item.createdAt).format('YYYY-MM-DD hh:mm:ss A')}
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                <Grid container key={index} sx={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 1, alignItems: 'flex-end' }}>
                  <Box>
                    <Box sx={{ border: '1px solid silver', color: 'white', background: 'silver', p: 1, borderRadius: 2, mb: 0.5 }}>
                      {item.attachment ? (
                        <>
                          {renderAttachment(item.attachment, item.message)}
                          <Box>
                            <a target='_blank' rel='noopener noreferrer' href={`${import.meta.env.VITE_PUBLIC_URL}/${item.attachment}`} style={{ textDecoration: 'none', color: 'white', background: 'purple', cursor: 'pointer', padding: '8px 12px', borderRadius: 4 }}>View</a>
                          </Box>
                        </>
                      ) : (
                        item.message
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {moment(item.createdAt).format('YYYY-MM-DD hh:mm:ss A')}
                    </Typography>
                  </Box>
                  <Avatar>U</Avatar>
                </Grid>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Chat Input Box - only show if ticket is open */}
        {history?.[0]?.status === 'open' && (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', mt: 1 }}>
              <TextField
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                fullWidth
                placeholder='Enter Message...'
                size='small'
              />
              <input
                type="file"
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleAttach}
              />
              <IconButton onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                <AttachFileIcon />
              </IconButton>
              <IconButton onClick={handleSend} color="primary">
                <SendIcon />
              </IconButton>
            </Box>
            {attachmentPreview.preview && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <img src={attachmentPreview.preview} alt="preview" height="40" style={{ borderRadius: 4 }} />
                <Button size="small" onClick={() => setAttachmentPreview({ preview: '', raw: null })}>Remove</Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ChatHistory;