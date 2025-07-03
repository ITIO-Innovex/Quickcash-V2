import { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '@/components/common/pageHeader';
import { Box, Avatar, Typography, IconButton, useTheme, TextField, Button } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import api from '@/helpers/apiHelper';
import moment from 'moment';

const ChatHistory = () => {
  const theme = useTheme();
  const location = useLocation();
  const { ticketId, userId } = location.state || {};
  const [history, setHistory] = useState<any[]>([]); // chat array from API
  const [message, setMessage] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState<{ preview: string; raw: File | null }>({ preview: '', raw: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

  // Fetch chat history from API
  const fetchChatHistory = async () => {
    if (!ticketId) {
      setError('No ticket ID provided');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/${url}/v1/support/listbyid/${ticketId}`);
      if (res.data.status === '201' || res.data.status === 201) {
        setHistory(res.data.data);
      } else {
        setError('Failed to load chat history.');
      }
    } catch (err) {
      setError('Failed to load chat history.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ticketId) fetchChatHistory();
  }, [ticketId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  // Handle sending message
  const handleSend = async () => {
    if (!message && !attachmentPreview.raw) return;
    if (!ticketId || !userId) {
      setError('Missing ticket or user ID');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('support', ticketId);
      formData.append('user', userId);
      formData.append('message', message);
      formData.append('from', 'User');
      formData.append('to', 'Admin');
      if (attachmentPreview.raw) {
        formData.append('attachment', attachmentPreview.raw);
      }
      await api.post(`/${url}/v1/support/replyticket`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('');
      setAttachmentPreview({ preview: '', raw: null });
      fetchChatHistory();
    } catch (err) {
      setError('Failed to send message.');
    }
  };

  // Handle file attachment
  const handleAttach = (e: any) => {
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
  const renderAttachment = (attachment: string, message: string) => {
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
        onError={({ currentTarget }: any) => {
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
          {history?.[0]?.chat?.length === 0 || !history?.[0]?.chat ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                No chat messages found for this ticket.
              </Typography>
            </Box>
          ) : (
            history?.[0]?.chat?.map((item: any, index: number) => {
              const isAdmin = item.from === 'Admin';
              return isAdmin ? (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'flex-start', mb: 1 }}>
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
                </Box>
              ) : (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 1, alignItems: 'flex-end', mb: 1 }}>
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
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>
        {/* Chat Input Box - only show if ticket is open */}
        {history?.[0]?.status === 'open' || history?.[0]?.status === 'pending' ? (
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
        ) : null}
      </Box>
    </Box>
  );
};

export default ChatHistory;