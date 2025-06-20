import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Link,
  Chip,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  SmartToy as BotIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const extractFileName = (url: string): string => {
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1] || 'Document';
    } catch {
      return 'Document';
    }
  };

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
                Sources:
              </Typography>
              <Stack spacing={1}>
                {message.sources.map((source, index) => (
                  <Chip
                    key={index}
                    label={extractFileName(source)}
                    component={Link}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    size="small"
                    icon={<DownloadIcon fontSize="small" />}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      alignSelf: 'flex-start',
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};