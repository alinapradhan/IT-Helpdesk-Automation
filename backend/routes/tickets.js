const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const nlpService = require('../utils/nlpService');
const automationService = require('../utils/automationService');

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const { status, category, priority, assignee } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (assignee) filter['assignee.email'] = assignee;
    
    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single ticket
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new ticket
router.post('/', async (req, res) => {
  try {
    const ticketData = req.body;
    
    // Use NLP to categorize and prioritize
    const nlpResult = await nlpService.analyzeRequest(ticketData.description);
    ticketData.category = nlpResult.category;
    ticketData.priority = nlpResult.priority;
    ticketData.tags = nlpResult.tags;
    
    const ticket = new Ticket(ticketData);
    await ticket.save();
    
    // Check if automation can handle this
    const automationResult = await automationService.handleTicket(ticket);
    if (automationResult.handled) {
      ticket.status = 'resolved';
      ticket.automated = true;
      ticket.comments.push({
        author: 'System',
        content: automationResult.resolution,
        timestamp: new Date()
      });
      await ticket.save();
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('ticket_created', ticket);
    
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ticket
router.put('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`ticket_${ticket._id}`).emit('ticket_updated', ticket);
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to ticket
router.post('/:id/comments', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    ticket.comments.push({
      author: req.body.author,
      content: req.body.content,
      isInternal: req.body.isInternal || false,
      timestamp: new Date()
    });
    
    await ticket.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`ticket_${ticket._id}`).emit('comment_added', {
      ticketId: ticket._id,
      comment: ticket.comments[ticket.comments.length - 1]
    });
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;