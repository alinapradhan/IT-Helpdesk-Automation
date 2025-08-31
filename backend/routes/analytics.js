const express = require('express');
const router = express.Router();

// Mock data for demo mode
const mockAnalytics = {
  totalTickets: 45,
  ticketsByStatus: {
    open: 12,
    in_progress: 8,
    resolved: 20,
    closed: 5
  },
  ticketsByCategory: {
    password_reset: 15,
    software_issue: 12,
    hardware_issue: 8,
    network_issue: 6,
    account_provisioning: 4
  },
  ticketsByPriority: {
    low: 18,
    medium: 20,
    high: 5,
    critical: 2
  },
  avgResolutionTimeHours: 4,
  automationRate: 65,
  dailyTrend: [
    { date: '2023-12-01', count: 5 },
    { date: '2023-12-02', count: 8 },
    { date: '2023-12-03', count: 6 },
    { date: '2023-12-04', count: 10 },
    { date: '2023-12-05', count: 7 },
    { date: '2023-12-06', count: 9 },
    { date: '2023-12-07', count: 12 }
  ]
};

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const isDemoMode = req.app.get('demoMode');
    
    if (isDemoMode) {
      // Return mock data for demo
      res.json(mockAnalytics);
      return;
    }

    // Real database logic would go here
    const { timeframe = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));
    
    const Ticket = require('../models/Ticket');
    
    // Total tickets
    const totalTickets = await Ticket.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    // Tickets by status
    const ticketsByStatus = await Ticket.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Tickets by category
    const ticketsByCategory = await Ticket.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Tickets by priority
    const ticketsByPriority = await Ticket.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    // Average resolution time (for resolved tickets)
    const resolvedTickets = await Ticket.find({
      status: 'resolved',
      createdAt: { $gte: startDate }
    });
    
    let avgResolutionTime = 0;
    if (resolvedTickets.length > 0) {
      const totalResolutionTime = resolvedTickets.reduce((sum, ticket) => {
        return sum + (ticket.updatedAt - ticket.createdAt);
      }, 0);
      avgResolutionTime = totalResolutionTime / resolvedTickets.length;
    }
    
    // Automation rate
    const automatedTickets = await Ticket.countDocuments({
      automated: true,
      createdAt: { $gte: startDate }
    });
    const automationRate = totalTickets > 0 ? (automatedTickets / totalTickets) * 100 : 0;
    
    // Daily ticket creation trend
    const dailyTrend = await Ticket.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    res.json({
      totalTickets,
      ticketsByStatus: ticketsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      ticketsByCategory: ticketsByCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      ticketsByPriority: ticketsByPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      avgResolutionTimeHours: Math.round(avgResolutionTime / (1000 * 60 * 60)),
      automationRate: Math.round(automationRate),
      dailyTrend: dailyTrend.map(item => ({
        date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get satisfaction metrics
router.get('/satisfaction', async (req, res) => {
  try {
    // This would integrate with a satisfaction survey system
    // For now, return mock data
    res.json({
      averageRating: 4.2,
      totalResponses: 150,
      distribution: {
        5: 45,
        4: 60,
        3: 30,
        2: 10,
        1: 5
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get performance metrics
router.get('/performance', async (req, res) => {
  try {
    const isDemoMode = req.app.get('demoMode');
    
    if (isDemoMode) {
      res.json({
        avgFirstResponseTimeHours: 2,
        ticketsResolved: 20,
        ticketsEscalated: 3
      });
      return;
    }
    
    const { timeframe = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));
    
    const Ticket = require('../models/Ticket');
    
    // First response time
    const tickets = await Ticket.find({
      createdAt: { $gte: startDate },
      'comments.0': { $exists: true }
    });
    
    let avgFirstResponseTime = 0;
    if (tickets.length > 0) {
      const totalFirstResponseTime = tickets.reduce((sum, ticket) => {
        if (ticket.comments.length > 0) {
          return sum + (ticket.comments[0].timestamp - ticket.createdAt);
        }
        return sum;
      }, 0);
      avgFirstResponseTime = totalFirstResponseTime / tickets.length;
    }
    
    res.json({
      avgFirstResponseTimeHours: Math.round(avgFirstResponseTime / (1000 * 60 * 60)),
      ticketsResolved: await Ticket.countDocuments({
        status: 'resolved',
        createdAt: { $gte: startDate }
      }),
      ticketsEscalated: await Ticket.countDocuments({
        priority: 'critical',
        createdAt: { $gte: startDate }
      })
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;