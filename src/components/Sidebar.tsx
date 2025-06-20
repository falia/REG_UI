import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { Topic } from '../types/chat';

interface SidebarProps {
  topics: Topic[];
  selectedTopicId: string | null;
  onTopicSelect: (topicId: string) => void;
  onNewTopic: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  topics,
  selectedTopicId,
  onTopicSelect,
  onNewTopic,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        backgroundColor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
          CSSF Chat Assistant
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ pt: 1 }}>
          {topics.map((topic) => (
            <ListItem key={topic.id} disablePadding>
              <ListItemButton
                selected={topic.id === selectedTopicId}
                onClick={() => onTopicSelect(topic.id)}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ChatIcon sx={{ mr: 2, fontSize: 20 }} />
                <ListItemText
                  primary={topic.title}
                  secondary={formatDate(topic.createdAt)}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: 500,
                    noWrap: true,
                  }}
                  secondaryTypographyProps={{
                    fontSize: 12,
                    color: selectedTopicId === topic.id ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Fab
          color="primary"
          variant="extended"
          onClick={onNewTopic}
          sx={{ width: '100%' }}
        >
          <AddIcon sx={{ mr: 1 }} />
          New Chat
        </Fab>
      </Box>
    </Box>
  );
};