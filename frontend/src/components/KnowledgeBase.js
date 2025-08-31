import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Chip,
  InputAdornment,
  Rating,
  IconButton
} from '@mui/material';
import { Search, ThumbUp, ThumbDown, Visibility } from '@mui/icons-material';
import api from '../services/api';

const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('limit', '20');

      const response = await api.get(`/knowledge-base?${params.toString()}`);
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleRateArticle = async (articleId, helpful) => {
    try {
      await api.post(`/knowledge-base/${articleId}/rate`, { helpful });
      // Refresh articles to show updated ratings
      fetchArticles();
    } catch (error) {
      console.error('Error rating article:', error);
    }
  };

  const categories = [
    'Password Reset',
    'Software Issues',
    'Hardware Issues',
    'Network Issues',
    'Account Management',
    'Security',
    'Email',
    'VPN',
    'Troubleshooting'
  ];

  const getHelpfulnessRatio = (article) => {
    const total = article.helpfulCount + article.notHelpfulCount;
    if (total === 0) return 0;
    return (article.helpfulCount / total) * 5; // Convert to 5-star scale
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Knowledge Base
      </Typography>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="All Categories"
            onClick={() => setSelectedCategory('')}
            color={selectedCategory === '' ? 'primary' : 'default'}
            clickable
          />
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => setSelectedCategory(category.toLowerCase().replace(' ', '_'))}
              color={selectedCategory === category.toLowerCase().replace(' ', '_') ? 'primary' : 'default'}
              clickable
            />
          ))}
        </Box>
      </Box>

      {/* Articles Grid */}
      <Grid container spacing={3}>
        {articles.map((article) => (
          <Grid item xs={12} md={6} lg={4} key={article._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {article.title}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {article.content.substring(0, 150)}...
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={article.category.replace('_', ' ').toUpperCase()}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Visibility fontSize="small" color="action" />
                    <Typography variant="caption" color="textSecondary">
                      {article.views}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Rating
                      value={getHelpfulnessRatio(article)}
                      readOnly
                      size="small"
                    />
                    <Typography variant="caption" color="textSecondary" display="block">
                      {article.helpfulCount + article.notHelpfulCount} ratings
                    </Typography>
                  </Box>
                  
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRateArticle(article._id, true)}
                      color="success"
                    >
                      <ThumbUp fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" sx={{ mx: 0.5 }}>
                      {article.helpfulCount}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRateArticle(article._id, false)}
                      color="error"
                    >
                      <ThumbDown fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                      {article.notHelpfulCount}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {articles.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No articles found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your search terms or category filter
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default KnowledgeBase;