const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['password_reset', 'software_issue', 'hardware_issue', 'account_provisioning', 'network_issue', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  requester: {
    name: String,
    email: String,
    department: String
  },
  assignee: {
    name: String,
    email: String
  },
  tags: [String],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  comments: [{
    author: String,
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  automated: {
    type: Boolean,
    default: false
  },
  integrationData: {
    serviceNowId: String,
    jiraId: String,
    zendeskId: String
  }
}, {
  timestamps: true
});

// Generate unique ticket ID
ticketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);