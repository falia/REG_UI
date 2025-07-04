import React, { useState, useEffect, useRef } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Snackbar,
  Alert,
  LinearProgress,
  Typography,
  Chip,
} from '@mui/material';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import { v4 as uuidv4 } from 'uuid';

import theme from './theme';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { 
  ChatService, 
  ChatHistory, 
  JobStatusResponse,
  ChatServiceWithState,
  formatComparisonResult 
} from './services/chatService';
import { Message, Topic } from './types/chat';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

// Enhanced Message type to include job status
interface EnhancedMessage extends Message {
  jobStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress?: string;
}

function App() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<{
    jobId: string;
    status: string;
    progress?: string;
  } | null>(null);

  const chatServiceRef = useRef<ChatServiceWithState | null>(null);

  // Load topics on mount
  useEffect(() => {
    loadTopics();
  }, []);

  // Load messages when topic changes
  useEffect(() => {
    if (selectedTopicId) {
      loadMessages(selectedTopicId);
    } else {
      setMessages([]);
    }
  }, [selectedTopicId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chatServiceRef.current) {
        chatServiceRef.current.destroy();
      }
    };
  }, []);

  const loadTopics = async () => {
    try {
      const { data } = await client.models.Topic.list();
      const sortedTopics = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTopics(sortedTopics);
    } catch (error) {
      console.error('Error loading topics:', error);
      setError('Failed to load chat topics');
    }
  };

  const loadMessages = async (topicId: string) => {
    try {
      const { data } = await client.models.Message.list({
        filter: { topicId: { eq: topicId } }
      });
      const sortedMessages = data.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  };

  const createNewTopic = async () => {
    try {
      const newTopic = {
        id: uuidv4(),
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await client.models.Topic.create(newTopic);
      setTopics(prev => [newTopic, ...prev]);
      setSelectedTopicId(newTopic.id);
    } catch (error) {
      console.error('Error creating topic:', error);
      setError('Failed to create new chat');
    }
  };

  const deleteTopic = async (topicId: string) => {
    try {
      const { data: topicMessages } = await client.models.Message.list({
        filter: { topicId: { eq: topicId } }
      });
      
      await Promise.all(
        topicMessages.map(message => 
          client.models.Message.delete({ id: message.id })
        )
      );
      
      await client.models.Topic.delete({ id: topicId });
      
      setTopics(prev => prev.filter(topic => topic.id !== topicId));
      
      if (selectedTopicId === topicId) {
        setSelectedTopicId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      setError('Failed to delete chat');
    }
  };

  const deleteAllTopics = async () => {
    try {
      const { data: allMessages } = await client.models.Message.list();
      await Promise.all(
        allMessages.map(message => 
          client.models.Message.delete({ id: message.id })
        )
      );
      
      const { data: allTopics } = await client.models.Topic.list();
      await Promise.all(
        allTopics.map(topic => 
          client.models.Topic.delete({ id: topic.id })
        )
      );
      
      setTopics([]);
      setSelectedTopicId(null);
      setMessages([]);
    } catch (error) {
      console.error('Error deleting all topics:', error);
      setError('Failed to delete all chats');
    }
  };

  const updateTopicTitle = async (topicId: string, newTitle: string) => {
    try {
      await client.models.Topic.update({
        id: topicId,
        title: newTitle,
        updatedAt: new Date().toISOString(),
      });

      setTopics(prev => 
        prev.map(topic => 
          topic.id === topicId 
            ? { ...topic, title: newTitle, updatedAt: new Date().toISOString() }
            : topic
        )
      );
    } catch (error) {
      console.error('Error updating topic title:', error);
      setError('Failed to update chat title');
    }
  };

  const saveMessage = async (message: Omit<EnhancedMessage, 'id' | 'createdAt'>) => {
    try {
      const newMessage = {
        ...message,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };

      await client.models.Message.create(newMessage);
      return newMessage;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  };

  const handleSendMessage = async (content: string, currentUser: any) => {
    if (!selectedTopicId) return;

    setLoading(true);
    setError(null);
    setProcessingStatus(null);

    try {
      // Save user message
      const userMessage = await saveMessage({
        topicId: selectedTopicId,
        content,
        role: 'user',
      });

      setMessages(prev => [...prev, userMessage]);

      // Update topic title if it's the first message
      const currentTopic = topics.find(t => t.id === selectedTopicId);
      if (currentTopic?.title === 'New Chat') {
        const title = content.length > 50 
          ? content.substring(0, 50) + '...' 
          : content;
        updateTopicTitle(selectedTopicId, title);
      }

      // Prepare conversation history
      const history: ChatHistory[] = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map((msg, index, arr) => {
          if (msg.role === 'user' && index < arr.length - 1 && arr[index + 1].role === 'assistant') {
            return {
              user: msg.content,
              assistant: arr[index + 1].content,
            };
          }
          return null;
        })
        .filter(Boolean) as ChatHistory[];

      // Create temporary message for UI feedback only
      const tempId = uuidv4();
      const tempMessage = {
        id: tempId,
        topicId: selectedTopicId,
        content: 'Processing your request...',
        role: 'assistant' as const,
        createdAt: new Date().toISOString(),
        jobStatus: 'PENDING' as const,
      };

      setMessages(prev => [...prev, tempMessage]);

      // Initialize chat service
      if (chatServiceRef.current) {
        chatServiceRef.current.destroy();
      }

      chatServiceRef.current = new ChatServiceWithState({
        onStatusUpdate: (status: JobStatusResponse) => {
          setProcessingStatus({
            jobId: status.jobId,
            status: status.status,
            progress: status.progress,
          });

          // Show progress in message content (like before)
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempId 
                ? { 
                    ...msg, 
                    content: '',
                    jobStatus: status.status,
                    progress: status.progress
                  }
                : msg
            )
          );
        },

        onResult: async (result) => {
          setProcessingStatus(null);
          setLoading(false);

          try {
            let finalContent = result.answer || 'No response received';
            
            // Handle comparison results
            if (result.comparison) {
              try {
                finalContent = formatComparisonResult(result);
              } catch (formatError) {
                console.warn('formatComparisonResult failed, using fallback');
                finalContent = result.comparison.replace(/```/g, '').trim();
              }
            }

            // Save the final assistant message
            const assistantMessage = await saveMessage({
              topicId: selectedTopicId,
              content: finalContent,
              role: 'assistant',
              sources: result.sources || [],
            });

            // Replace temporary message with final message
            setMessages(prev => 
              prev.map(msg => 
                msg.id === tempId 
                  ? { ...assistantMessage, jobStatus: 'COMPLETED' as const }
                  : msg
              )
            );

          } catch (error) {
            console.error('Error saving result:', error);
            setError('Failed to save response');
            
            setMessages(prev => 
              prev.map(msg => 
                msg.id === tempId 
                  ? { ...msg, content: `Error: ${error.message}`, jobStatus: 'FAILED' as const }
                  : msg
              )
            );
          }
        },

        onError: (errorMessage) => {
          setProcessingStatus(null);
          setLoading(false);
          setError(errorMessage);

          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempId 
                ? { ...msg, content: `Error: ${errorMessage}`, jobStatus: 'FAILED' as const }
                : msg
            )
          );
        },
      });

      // Submit the query
      await chatServiceRef.current.submitQuery(content, history, {
        max_results: 20,
        threshold: 0.7,
      });

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setError('Failed to send message');
      setLoading(false);
      setProcessingStatus(null);
    }
  };

  const handleCancelProcessing = () => {
    if (chatServiceRef.current) {
      chatServiceRef.current.stopPolling();
      setProcessingStatus(null);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'PROCESSING': return 'info';
      case 'COMPLETED': return 'success';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Authenticator>
        {({ signOut, user }) => (
          <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', flexGrow: 1 }}>
              <Sidebar
                topics={topics}
                selectedTopicId={selectedTopicId}
                onTopicSelect={setSelectedTopicId}
                onNewTopic={createNewTopic}
                onDeleteTopic={deleteTopic}
                onDeleteAllTopics={deleteAllTopics}
              />
              <ChatArea
                messages={messages}
                onSendMessage={(content) => handleSendMessage(content, user)}
                loading={loading}
                selectedTopicId={selectedTopicId}
                processingStatus={processingStatus}
              />
            </Box>

            <Snackbar
              open={!!error}
              autoHideDuration={6000}
              onClose={() => setError(null)}
            >
              <Alert onClose={() => setError(null)} severity="error">
                {error}
              </Alert>
            </Snackbar>
          </Box>
        )}
      </Authenticator>
    </ThemeProvider>
  );
}

export default App;