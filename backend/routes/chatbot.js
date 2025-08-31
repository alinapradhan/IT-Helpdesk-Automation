const express = require('express');
const router = express.Router();
const nlpService = require('../utils/nlpService');

// Mock knowledge base for demo mode
const mockKnowledgeBase = [
  {
    _id: '1',
    title: 'How to Reset Your Password',
    content: 'To reset your password, go to the login page and click "Forgot Password"...',
    category: 'password_reset'
  },
  {
    _id: '2', 
    title: 'VPN Setup Guide',
    content: 'To set up VPN, download the client from the company portal...',
    category: 'network_issue'
  }
];

// Process chatbot message
router.post('/message', async (req, res) => {
  try {
    const { message, userId, sessionId } = req.body;
    const isDemoMode = req.app.get('demoMode');
    
    // Analyze the message using NLP
    const nlpResult = await nlpService.analyzeRequest(message);
    
    let response = {
      message: '',
      suggestions: [],
      actions: [],
      requiresTicket: false
    };
    
    // Check if this is a greeting or simple query
    if (nlpResult.intent === 'greeting') {
      response.message = "Hello! I'm your IT support assistant. How can I help you today?";
      response.suggestions = [
        "I need to reset my password",
        "I'm having software issues",
        "I need help with hardware",
        "I want to check my ticket status"
      ];
    }
    // Check if user wants to check ticket status
    else if (nlpResult.intent === 'check_status') {
      response.message = "I can help you check your ticket status. Please provide your ticket ID or email address.";
      response.actions = ['request_ticket_info'];
    }
    // Try to find solutions in knowledge base
    else {
      let knowledgeResults = [];
      
      if (isDemoMode) {
        // Use mock data
        knowledgeResults = mockKnowledgeBase.filter(article => 
          article.title.toLowerCase().includes(message.toLowerCase()) ||
          article.content.toLowerCase().includes(message.toLowerCase()) ||
          article.category === nlpResult.category
        ).slice(0, 3);
      } else {
        // Use real database
        const KnowledgeBase = require('../models/KnowledgeBase');
        knowledgeResults = await KnowledgeBase.find({
          $text: { $search: message }
        }).limit(3);
      }
      
      if (knowledgeResults.length > 0) {
        response.message = "I found some articles that might help:";
        response.suggestions = knowledgeResults.map(article => ({
          title: article.title,
          content: article.content.substring(0, 200) + '...',
          id: article._id
        }));
        response.actions = ['show_articles', 'create_ticket'];
      } else {
        // Check if this can be automated
        if (nlpResult.category === 'password_reset') {
          response.message = "I can help you reset your password. Please confirm your email address and I'll send you reset instructions.";
          response.actions = ['password_reset'];
        } else {
          response.message = "I couldn't find a direct solution for your issue. Would you like me to create a support ticket for you?";
          response.requiresTicket = true;
          response.actions = ['create_ticket'];
        }
      }
    }
    
    res.json(response);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle password reset automation
router.post('/password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    const isDemoMode = req.app.get('demoMode');
    
    if (isDemoMode) {
      // Demo mode - simulate success
      setTimeout(() => {
        const io = req.app.get('io');
        io.emit('password_reset_complete', { email, success: true });
      }, 2000);
      
      res.json({
        message: "Password reset initiated! You should receive an email with instructions shortly. (Demo mode - no actual email sent)",
        ticketId: 'DEMO-' + Math.random().toString(36).substr(2, 6).toUpperCase()
      });
    } else {
      // Real mode with database
      const Ticket = require('../models/Ticket');
      const ticket = new Ticket({
        title: 'Password Reset Request',
        description: `Automated password reset request for ${email}`,
        category: 'password_reset',
        priority: 'medium',
        requester: { email },
        automated: true,
        status: 'in_progress'
      });
      
      await ticket.save();
      
      // Simulate password reset process
      setTimeout(async () => {
        ticket.status = 'resolved';
        ticket.comments.push({
          author: 'System',
          content: 'Password reset email sent successfully. Please check your inbox.',
          timestamp: new Date()
        });
        await ticket.save();
        
        // Emit real-time update
        const io = req.app.get('io');
        io.emit('ticket_updated', ticket);
      }, 2000);
      
      res.json({
        message: "Password reset initiated! You should receive an email with instructions shortly.",
        ticketId: ticket.ticketId
      });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get chat history (if implementing sessions)
router.get('/history/:sessionId', async (req, res) => {
  try {
    // This would typically fetch from a chat history collection
    // For now, return empty array
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;