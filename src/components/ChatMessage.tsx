import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Link,
  Chip,
  Button,
} from '@mui/material';
import {
  Person as PersonIcon,
  SmartToy as BotIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [showAllSources, setShowAllSources] = useState(false);

  const extractFileName = (url: string): string => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1] || 'Document';
      
      // If filename is too long, truncate it
      if (fileName.length > 30) {
        const extension = fileName.split('.').pop();
        const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
        const truncatedName = nameWithoutExt.substring(0, 20);
        return `${truncatedName}...${extension ? `.${extension}` : ''}`;
      }
      
      return fileName;
    } catch {
      return 'Document';
    }
  };

  const isPdf = (url: string): boolean => {
    return url.toLowerCase().endsWith('.pdf');
  };

  const getDisplayedSources = () => {
    if (!message.sources) return [];
    return showAllSources ? message.sources : message.sources.slice(0, 4);
  };

  const shouldShowToggle = message.sources && message.sources.length > 4;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          maxWidth: '80%',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: isUser ? 'primary.main' : 'secondary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
            mx: 1,
          }}
        >
          {isUser ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
        </Box>

        <Paper
          sx={{
            p: 2,
            backgroundColor: isUser ? 'primary.main' : 'background.paper',
            color: isUser ? 'white' : 'text.primary',
            borderRadius: 2,
            maxWidth: '600px',
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: message.sources?.length ? 2 : 0 }}>
            {message.content}
          </Typography>

          {message.sources && message.sources.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Sources ({message.sources.length}):
              </Typography>
              
              {/* Horizontal layout for sources */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: shouldShowToggle ? 1 : 0,
                }}
              >
                {getDisplayedSources().map((source, index) => (
                  <Chip
                    key={index}
                    label={extractFileName(source)}
                    component={Link}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    size="small"
                    icon={
                      isPdf(source) ? (
                        <PdfIcon fontSize="small" />
                      ) : (
                        <DownloadIcon fontSize="small" />
                      )
                    }
                    sx={{
                      backgroundColor: isUser 
                        ? 'rgba(255, 255, 255, 0.15)' 
                        : 'rgba(13, 71, 161, 0.08)',
                      color: isUser ? 'white' : 'primary.main',
                      border: isUser ? 'none' : '1px solid rgba(13, 71, 161, 0.2)',
                      '&:hover': {
                        backgroundColor: isUser 
                          ? 'rgba(255, 255, 255, 0.25)' 
                          : 'rgba(13, 71, 161, 0.12)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      },
                      transition: 'all 0.2s ease-in-out',
                      maxWidth: '200px',
                      '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    }}
                  />
                ))}
              </Box>

              {/* Show More/Less button */}
              {shouldShowToggle && (
                <Button
                  size="small"
                  onClick={() => setShowAllSources(!showAllSources)}
                  startIcon={showAllSources ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{
                    color: isUser ? 'rgba(255, 255, 255, 0.8)' : 'primary.main',
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    minHeight: 'auto',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: isUser 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(13, 71, 161, 0.08)',
                    },
                  }}
                >
                  {showAllSources 
                    ? 'Show Less' 
                    : `Show ${message.sources.length - 4} More`
                  }
                </Button>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};