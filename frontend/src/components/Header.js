import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { Chat, Dashboard, Assignment, Book } from '@mui/icons-material';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Chat', icon: <Chat /> },
    { path: '/dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/tickets', label: 'Tickets', icon: <Assignment /> },
    { path: '/knowledge-base', label: 'Knowledge Base', icon: <Book /> }
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          IT Helpdesk Automation
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              component={Link}
              to={item.path}
              startIcon={item.icon}
              variant={location.pathname === item.path ? 'outlined' : 'text'}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;