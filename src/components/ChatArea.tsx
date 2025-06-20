import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Message } from '../types/chat';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  loading: boolean;
  selectedTopicId: string | null;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onSendMessage,
  loading,
  selectedTopicId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!selectedTopicId) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          p: 4,
        }}
      >
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 400,
          }}
        >
          <ChatIcon
            sx={{
              fontSize: 64,
              color: 'primary.main',
              mb: 2,
            }}
          />
          <Typography variant="h5" gutterBottom>
            Welcome to CSSF Chat Assistant
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start a new conversation to ask questions about Luxembourg financial regulations and CSSF documentation.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Start the conversation by asking a question...
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      <ChatInput
        onSendMessage={onSendMessage}
        loading={loading}
        disabled={!selectedTopicId}
      />
    </Box>
  );
};