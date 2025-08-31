import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material';
import { Send, SmartToy, Person } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your IT support assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post('/chatbot/message', {
        message: inputValue,
        userId: 'user-123', // In real app, this would be from auth
        sessionId: 'session-123'
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.message,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: response.data.suggestions,
        actions: response.data.actions,
        requiresTicket: response.data.requiresTicket
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(typeof suggestion === 'string' ? suggestion : suggestion.title);
  };

  const handleActionClick = async (action) => {
    if (action === 'password_reset') {
      const email = prompt('Please enter your email address:');
      if (email) {
        try {
          const response = await api.post('/chatbot/password-reset', { email });
          const botMessage = {
            id: Date.now(),
            text: response.data.message,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          toast.success('Password reset initiated!');
        } catch (error) {
          toast.error('Failed to initiate password reset');
        }
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        IT Support Chat
      </Typography>
      
      <Paper sx={{ height: 500, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  maxWidth: '70%',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <Avatar sx={{ bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main' }}>
                  {message.sender === 'user' ? <Person /> : <SmartToy />}
                </Avatar>
                <Box>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                      color: message.sender === 'user' ? 'white' : 'text.primary'
                    }}
                  >
                    <Typography variant="body1">{message.text}</Typography>
                  </Paper>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {message.suggestions.map((suggestion, index) => (
                        <Chip
                          key={index}
                          label={typeof suggestion === 'string' ? suggestion : suggestion.title}
                          onClick={() => handleSuggestionClick(suggestion)}
                          size="small"
                          clickable
                        />
                      ))}
                    </Box>
                  )}
                  
                  {message.actions && message.actions.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {message.actions.map((action, index) => (
                        <Button
                          key={index}
                          size="small"
                          variant="outlined"
                          onClick={() => handleActionClick(action)}
                        >
                          {action.replace('_', ' ').toUpperCase()}
                        </Button>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <SmartToy />
                </Avatar>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Typing...
                </Typography>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              endIcon={<Send />}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatBot;