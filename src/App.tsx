import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import { v4 as uuidv4 } from 'uuid';

import theme from './theme';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatService, ChatHistory } from './services/chatService';
import { Message, Topic } from './types/chat';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

function App() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const updateTopicTitle = async (topicId: string, newTitle: string) => {
  try {
    // Update the topic in the database
    await client.models.Topic.update({
      id: topicId,
      title: newTitle,
      updatedAt: new Date().toISOString(),
    });

    // Update the local state
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
      // Delete all messages for this topic first
      const { data: topicMessages } = await client.models.Message.list({
        filter: { topicId: { eq: topicId } }
      });
      
      // Delete messages
      await Promise.all(
        topicMessages.map(message => 
          client.models.Message.delete({ id: message.id })
        )
      );
      
      // Delete the topic
      await client.models.Topic.delete({ id: topicId });
      
      // Update local state
      setTopics(prev => prev.filter(topic => topic.id !== topicId));
      
      // If we deleted the selected topic, clear selection
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
      // Delete all messages first
      const { data: allMessages } = await client.models.Message.list();
      await Promise.all(
        allMessages.map(message => 
          client.models.Message.delete({ id: message.id })
        )
      );
      
      // Delete all topics
      const { data: allTopics } = await client.models.Topic.list();
      await Promise.all(
        allTopics.map(topic => 
          client.models.Topic.delete({ id: topic.id })
        )
      );
      
      // Clear local state
      setTopics([]);
      setSelectedTopicId(null);
      setMessages([]);
    } catch (error) {
      console.error('Error deleting all topics:', error);
      setError('Failed to delete all chats');
    }
  };

  const saveMessage = async (message: Omit<Message, 'id' | 'createdAt'>) => {
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

  const handleSendMessage = async (content: string) => {
    if (!selectedTopicId) return;

    setLoading(true);
    setError(null);

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

      // Call Lambda function
      const response = await ChatService.sendMessage(content, history);

      if (response.success) {
        // Save assistant response
        const assistantMessage = await saveMessage({
          topicId: selectedTopicId,
          content: response.answer,
          role: 'assistant',
          sources: response.sources,
        });

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setError(response.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Authenticator>
        {({ signOut, user }) => (
          <Box sx={{ display: 'flex', height: '100vh' }}>
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
              onSendMessage={handleSendMessage}
              loading={loading}
              selectedTopicId={selectedTopicId}
            />
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