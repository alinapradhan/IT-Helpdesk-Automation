const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [String],
  keywords: [String],
  helpfulCount: {
    type: Number,
    default: 0
  },
  notHelpfulCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  author: {
    name: String,
    email: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  }
}, {
  timestamps: true
});

// Text index for search functionality
knowledgeBaseSchema.index({
  title: 'text',
  content: 'text',
  keywords: 'text'
});

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);