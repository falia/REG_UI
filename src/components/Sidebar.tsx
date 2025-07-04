import React, { useState } from 'react';
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
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Chat as ChatIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Topic } from '../types/chat';

interface SidebarProps {
  topics: Topic[];
  selectedTopicId: string | null;
  onTopicSelect: (topicId: string) => void;
  onNewTopic: () => void;
  onDeleteTopic: (topicId: string) => void;
  onDeleteAllTopics: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  topics,
  selectedTopicId,
  onTopicSelect,
  onNewTopic,
  onDeleteTopic,
  onDeleteAllTopics,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [topicMenuAnchor, setTopicMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMenuTopicId, setSelectedMenuTopicId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);

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

  const handleMainMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMainMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTopicMenuClick = (event: React.MouseEvent<HTMLElement>, topicId: string) => {
    event.stopPropagation();
    setTopicMenuAnchor(event.currentTarget);
    setSelectedMenuTopicId(topicId);
  };

  const handleTopicMenuClose = () => {
    setTopicMenuAnchor(null);
    setSelectedMenuTopicId(null);
  };

  const handleDeleteTopic = () => {
    if (selectedMenuTopicId) {
      setDeleteDialogOpen(true);
    }
    //handleTopicMenuClose();
  };

  const handleDeleteAllTopics = () => {
    setDeleteAllDialogOpen(true);
    handleMainMenuClose();
  };

  const confirmDeleteTopic = () => {
    if (selectedMenuTopicId) {
      onDeleteTopic(selectedMenuTopicId);
    }
    setDeleteDialogOpen(false);
    setSelectedMenuTopicId(null);
    setTopicMenuAnchor(null);
  };

  const confirmDeleteAllTopics = () => {
    onDeleteAllTopics();
    setDeleteAllDialogOpen(false);
  };

  const sidebarWidth = collapsed ? 60 : 280;

  return (
    <>
      <Box
        sx={{
          width: sidebarWidth,
          height: '100vh',
          backgroundColor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease-in-out',
          position: 'relative',
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Collapse in={!collapsed} orientation="horizontal">
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
              CSSF Chat Assistant
            </Typography>
          </Collapse>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {!collapsed && (
              <Tooltip title="Menu Options">
                <IconButton
                  size="small"
                  onClick={handleMainMenuClick}
                  sx={{ color: 'text.secondary' }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
              <IconButton
                size="small"
                onClick={() => setCollapsed(!collapsed)}
                sx={{ color: 'text.secondary' }}
              >
                {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Topics List */}
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
                  <ChatIcon sx={{ mr: collapsed ? 0 : 2, fontSize: 20, minWidth: 20 }} />
                  
                  {!collapsed && (
                    <>
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
                        sx={{ mr: 1 }}
                      />
                      
                      <Tooltip title="Topic Options">
                        <IconButton
                          size="small"
                          onClick={(e) => handleTopicMenuClick(e, topic.id)}
                          sx={{
                            color: selectedTopicId === topic.id ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                            opacity: 0.7,
                            '&:hover': { opacity: 1 },
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* New Chat Button */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          {collapsed ? (
            <Tooltip title="New Chat">
              <Fab
                color="primary"
                size="medium"
                onClick={onNewTopic}
                sx={{ width: 44, height: 44 }}
              >
                <AddIcon />
              </Fab>
            </Tooltip>
          ) : (
            <Fab
              color="primary"
              variant="extended"
              onClick={onNewTopic}
              sx={{ width: '100%' }}
            >
              <AddIcon sx={{ mr: 1 }} />
              New Chat
            </Fab>
          )}
        </Box>

        {/* Collapse/Expand Handle */}
        <Box
          sx={{
            position: 'absolute',
            right: -12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 24,
            height: 48,
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: '0 12px 12px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </Box>
      </Box>

      {/* Main Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMainMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleDeleteAllTopics} sx={{ color: 'error.main' }}>
          <DeleteSweepIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete All Chats
        </MenuItem>
      </Menu>

      {/* Topic Menu */}
      <Menu
        anchorEl={topicMenuAnchor}
        open={Boolean(topicMenuAnchor)}
        onClose={handleTopicMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleDeleteTopic} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete Chat
        </MenuItem>
      </Menu>

      {/* Delete Topic Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Chat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this chat? This action cannot be undone and all messages in this conversation will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteTopic} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Topics Confirmation Dialog */}
      <Dialog
        open={deleteAllDialogOpen}
        onClose={() => setDeleteAllDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete All Chats</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all chats? This action cannot be undone and all your conversation history will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteAllTopics} color="error" variant="contained">
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};