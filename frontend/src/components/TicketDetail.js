import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Chip,
  TextField,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { Person, Send } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

const TicketDetail = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      setSubmittingComment(true);
      await api.post(`/tickets/${id}/comments`, {
        author: 'Support Agent', // In real app, this would be from auth
        content: comment,
        isInternal: false
      });
      
      setComment('');
      await fetchTicket(); // Refresh ticket data
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'error',
      in_progress: 'warning',
      resolved: 'success',
      closed: 'default'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    };
    return colors[priority] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!ticket) {
    return <Typography color="error">Ticket not found</Typography>;
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {ticket.title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Ticket ID: {ticket.ticketId}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
            <Chip
              label={ticket.status.replace('_', ' ').toUpperCase()}
              color={getStatusColor(ticket.status)}
            />
            <Chip
              label={`Priority: ${ticket.priority.toUpperCase()}`}
              color={getPriorityColor(ticket.priority)}
            />
            {ticket.automated && (
              <Chip label="Automated" color="success" size="small" />
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {ticket.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Category
              </Typography>
              <Typography variant="body2">
                {ticket.category.replace('_', ' ').toUpperCase()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Requester
              </Typography>
              <Typography variant="body2">
                {ticket.requester?.name || 'N/A'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {ticket.requester?.email}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Created
              </Typography>
              <Typography variant="body2">
                {formatDate(ticket.createdAt)}
              </Typography>
            </Box>
            {ticket.assignee && (
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Assignee
                </Typography>
                <Typography variant="body2">
                  {ticket.assignee.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {ticket.assignee.email}
                </Typography>
              </Box>
            )}
          </Box>

          {ticket.tags && ticket.tags.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {ticket.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Comments */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comments ({ticket.comments?.length || 0})
        </Typography>

        {ticket.comments && ticket.comments.length > 0 ? (
          <List>
            {ticket.comments.map((commentItem, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">
                        {commentItem.author}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(commentItem.timestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {commentItem.content}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            No comments yet
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Add Comment
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submittingComment}
            />
            <Button
              variant="contained"
              onClick={handleAddComment}
              disabled={submittingComment || !comment.trim()}
              startIcon={<Send />}
              sx={{ height: 'fit-content' }}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default TicketDetail;