const express = require('express');
const router = express.Router();

// Mock knowledge base articles for demo mode
const mockArticles = [
  {
    _id: '1',
    title: 'How to Reset Your Password',
    content: `To reset your password:
    
1. Go to the login page
2. Click on "Forgot Password"
3. Enter your email address
4. Check your email for reset instructions
5. Follow the link and create a new password

If you don't receive the email within 10 minutes, check your spam folder or contact IT support.`,
    category: 'password_reset',
    keywords: ['password', 'reset', 'forgot', 'login'],
    tags: ['self-service', 'account'],
    helpfulCount: 25,
    notHelpfulCount: 2,
    views: 150,
    author: {
      name: 'IT Support Team',
      email: 'support@company.com'
    }
  },
  {
    _id: '2',
    title: 'Setting Up VPN Connection',
    content: `To set up VPN connection:

1. Download the VPN client from the company portal
2. Install the application
3. Enter your credentials (username/password)
4. Select the appropriate server location
5. Click Connect

For troubleshooting:
- Ensure you have a stable internet connection
- Check firewall settings
- Verify your credentials are correct
- Contact IT if the issue persists`,
    category: 'network_issue',
    keywords: ['vpn', 'connection', 'setup', 'remote'],
    tags: ['network', 'remote-work'],
    helpfulCount: 18,
    notHelpfulCount: 1,
    views: 89,
    author: {
      name: 'Network Team',
      email: 'network@company.com'
    }
  },
  {
    _id: '3',
    title: 'Software Installation Guide',
    content: `Before installing new software:

1. Check if the software is approved by IT
2. Verify system requirements
3. Close all running applications
4. Run the installer as administrator
5. Follow installation prompts
6. Restart your computer if required

If you encounter issues:
- Check available disk space
- Disable antivirus temporarily
- Run Windows Update
- Contact IT for assistance`,
    category: 'software_issue',
    keywords: ['software', 'installation', 'install', 'program'],
    tags: ['installation', 'troubleshooting'],
    helpfulCount: 22,
    notHelpfulCount: 3,
    views: 134,
    author: {
      name: 'IT Support Team',
      email: 'support@company.com'
    }
  }
];

// Get all knowledge base articles
router.get('/', async (req, res) => {
  try {
    const isDemoMode = req.app.get('demoMode');
    const { category, search, limit = 10 } = req.query;
    
    if (isDemoMode) {
      let articles = [...mockArticles];
      
      // Filter by category if specified
      if (category && category !== '') {
        articles = articles.filter(article => article.category === category);
      }
      
      // Filter by search if specified
      if (search && search !== '') {
        articles = articles.filter(article => 
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          article.content.toLowerCase().includes(search.toLowerCase()) ||
          article.keywords.some(keyword => keyword.toLowerCase().includes(search.toLowerCase()))
        );
      }
      
      res.json(articles.slice(0, parseInt(limit)));
      return;
    }
    
    // Real database logic
    const KnowledgeBase = require('../models/KnowledgeBase');
    let query = { status: 'published' };
    
    if (category) {
      query.category = category;
    }
    
    let articles;
    if (search) {
      articles = await KnowledgeBase.find({
        ...query,
        $text: { $search: search }
      }).limit(parseInt(limit));
    } else {
      articles = await KnowledgeBase.find(query)
        .sort({ views: -1, createdAt: -1 })
        .limit(parseInt(limit));
    }
    
    res.json(articles);
  } catch (error) {
    console.error('Knowledge base error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single article
router.get('/:id', async (req, res) => {
  try {
    const isDemoMode = req.app.get('demoMode');
    
    if (isDemoMode) {
      const article = mockArticles.find(a => a._id === req.params.id);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      // Simulate incrementing view count
      article.views += 1;
      res.json(article);
      return;
    }
    
    const KnowledgeBase = require('../models/KnowledgeBase');
    const article = await KnowledgeBase.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Increment view count
    article.views += 1;
    await article.save();
    
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new article
router.post('/', async (req, res) => {
  try {
    const isDemoMode = req.app.get('demoMode');
    
    if (isDemoMode) {
      res.status(501).json({ error: 'Demo mode - article creation not available' });
      return;
    }
    
    const KnowledgeBase = require('../models/KnowledgeBase');
    const article = new KnowledgeBase(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update article
router.put('/:id', async (req, res) => {
  try {
    const isDemoMode = req.app.get('demoMode');
    
    if (isDemoMode) {
      res.status(501).json({ error: 'Demo mode - article updates not available' });
      return;
    }
    
    const KnowledgeBase = require('../models/KnowledgeBase');
    const article = await KnowledgeBase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rate article as helpful/not helpful
router.post('/:id/rate', async (req, res) => {
  try {
    const { helpful } = req.body; // true for helpful, false for not helpful
    const isDemoMode = req.app.get('demoMode');
    
    if (isDemoMode) {
      const article = mockArticles.find(a => a._id === req.params.id);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      if (helpful) {
        article.helpfulCount += 1;
      } else {
        article.notHelpfulCount += 1;
      }
      
      res.json({ message: 'Rating recorded', article });
      return;
    }
    
    const KnowledgeBase = require('../models/KnowledgeBase');
    const article = await KnowledgeBase.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    if (helpful) {
      article.helpfulCount += 1;
    } else {
      article.notHelpfulCount += 1;
    }
    
    await article.save();
    res.json({ message: 'Rating recorded', article });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;