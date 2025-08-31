const express = require('express');
const router = express.Router();
const KnowledgeBase = require('../models/KnowledgeBase');

// Get all knowledge base articles
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 10 } = req.query;
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
    res.status(500).json({ error: error.message });
  }
});

// Get single article
router.get('/:id', async (req, res) => {
  try {
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