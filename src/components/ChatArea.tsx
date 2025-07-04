import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { 
  Chat as ChatIcon,
  CompareArrows,
  Timeline,
  Business,
  Recommend,
  Info,
} from '@mui/icons-material';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Message } from '../types/chat';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  loading: boolean;
  selectedTopicId: string | null;
  processingStatus?: {
    jobId: string;
    status: string;
    progress?: string;
  } | null;
}

interface ComparisonData {
  purpose_and_scope: string;
  key_differences: string;
  timeline_and_amendments: string;
  institutional_impact: string;
  recommendations: string;
}

// Comparison Formatter Component
const ComparisonFormatter: React.FC<{
  content: string;
  circular1?: string;
  circular2?: string;
}> = ({ content, circular1, circular2 }) => {
  // Extract JSON from content - improved detection
  const extractComparisonData = (text: string): ComparisonData | null => {
    try {
      // Look for the specific JSON structure that contains our comparison fields
      const patterns = [
        // Pattern 1: Direct JSON object with our fields
        /\{\s*"purpose_and_scope"[\s\S]*?"recommendations"[^}]*\}/,
        // Pattern 2: JSON response assignment
        /response\s*=\s*(\{[\s\S]*?"recommendations"[^}]*\})/,
        // Pattern 3: General JSON with our required fields
        /(\{[^{}]*"purpose_and_scope"[^{}]*"key_differences"[^{}]*"timeline_and_amendments"[^{}]*"institutional_impact"[^{}]*"recommendations"[^{}]*\})/
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          let jsonStr = match[1] || match[0];
          
          // Clean up common issues
          jsonStr = jsonStr.replace(/'/g, '"'); // Replace single quotes
          jsonStr = jsonStr.replace(/,\s*}/g, '}'); // Remove trailing commas
          
          try {
            const jsonData = JSON.parse(jsonStr);
            if (jsonData.purpose_and_scope && jsonData.key_differences && 
                jsonData.timeline_and_amendments && jsonData.institutional_impact && 
                jsonData.recommendations) {
              return jsonData;
            }
          } catch (parseError) {
            console.warn('JSON parse failed for pattern:', parseError);
            continue;
          }
        }
      }

      // Fallback: try to extract individual fields using regex
      const extractField = (fieldName: string): string | null => {
        const fieldPattern = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'i');
        const match = text.match(fieldPattern);
        return match ? match[1] : null;
      };

      const fields = {
        purpose_and_scope: extractField('purpose_and_scope'),
        key_differences: extractField('key_differences'),
        timeline_and_amendments: extractField('timeline_and_amendments'),
        institutional_impact: extractField('institutional_impact'),
        recommendations: extractField('recommendations')
      };

      // Check if we found all required fields
      if (Object.values(fields).every(field => field !== null)) {
        return fields as ComparisonData;
      }

      return null;
    } catch (error) {
      console.warn('Failed to extract comparison data:', error);
      return null;
    }
  };

  // Extract circular numbers from content
  const extractCircularNumbers = (text: string): { circular1?: string; circular2?: string } => {
    const cssf_pattern = /CSSF\s+\d{1,2}[-\/]\d{3}/gi;
    const matches = text.match(cssf_pattern);
    return {
      circular1: matches?.[0] || circular1,
      circular2: matches?.[1] || circular2,
    };
  };

  const comparisonData = extractComparisonData(content);
  const { circular1: c1, circular2: c2 } = extractCircularNumbers(content);

  // Debug logging
  console.log('Content detection:', {
    isComparison: !!comparisonData,
    hasRequiredFields: content.includes('purpose_and_scope'),
    contentPreview: content.substring(0, 200) + '...'
  });

  if (!comparisonData) {
    // If we detect comparison keywords but failed to parse, show a helpful message
    if (content.includes('purpose_and_scope') && content.includes('key_differences')) {
      return (
        <Box>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              🔍 Detected comparison content but couldn't parse the structure. Displaying as text:
            </Typography>
          </Alert>
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {content}
          </Typography>
        </Box>
      );
    }
    
    return (
      <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
        {content}
      </Typography>
    );
  }

  const sections = [
    {
      title: 'Purpose & Scope',
      content: comparisonData.purpose_and_scope,
      icon: <Info color="primary" />,
      color: 'primary.light',
    },
    {
      title: 'Key Differences',
      content: comparisonData.key_differences,
      icon: <CompareArrows color="secondary" />,
      color: 'secondary.light',
    },
    {
      title: 'Timeline & Amendments',
      content: comparisonData.timeline_and_amendments,
      icon: <Timeline color="info" />,
      color: 'info.light',
    },
    {
      title: 'Institutional Impact',
      content: comparisonData.institutional_impact,
      icon: <Business color="warning" />,
      color: 'warning.light',
    },
    {
      title: 'Recommendations',
      content: comparisonData.recommendations,
      icon: <Recommend color="success" />,
      color: 'success.light',
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 Circular Comparison Analysis
        </Typography>
        {(c1 || c2) && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            {c1 && <Chip label={c1} color="primary" variant="outlined" size="small" />}
            <CompareArrows sx={{ fontSize: 16, color: 'text.secondary' }} />
            {c2 && <Chip label={c2} color="secondary" variant="outlined" size="small" />}
          </Box>
        )}
      </Alert>

      {/* Comparison Sections */}
      <Grid container spacing={2}>
        {sections.map((section, index) => (
          <Grid item xs={12} key={index}>
            <Card 
              elevation={2}
              sx={{ 
                borderLeft: 4, 
                borderLeftColor: section.color,
                '&:hover': {
                  elevation: 4,
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out',
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {section.icon}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      ml: 1, 
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    {section.title}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.6,
                    color: 'text.secondary',
                    '& strong': { color: 'text.primary' }
                  }}
                >
                  {section.content}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Enhanced ChatMessage Component
const EnhancedChatMessage: React.FC<{ message: Message & { 
  jobId?: string;
  jobStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress?: string;
} }> = ({ message }) => {
  const isComparison = (content: string): boolean => {
    // More specific detection for comparison results
    const hasComparisonFields = content.includes('purpose_and_scope') && 
                               content.includes('key_differences') && 
                               content.includes('timeline_and_amendments') &&
                               content.includes('institutional_impact') &&
                               content.includes('recommendations');
                               
    const hasCircularContext = content.includes('CSSF') || 
                              content.includes('circular') || 
                              content.includes('Circular');
                              
    return hasComparisonFields && hasCircularContext;
  };

  const isAssistantComparison = message.role === 'assistant' && isComparison(message.content);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: isAssistantComparison ? '95%' : '80%',
          backgroundColor: message.role === 'user' ? 'primary.main' : 'background.paper',
          color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
          borderRadius: 2,
        }}
      >
        {message.role === 'user' ? (
          <Typography variant="body1">{message.content}</Typography>
        ) : isAssistantComparison ? (
          <ComparisonFormatter content={message.content} />
        ) : (
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>
        )}
        
        {/* Show processing status for pending/processing messages */}
        {message.jobStatus && message.jobStatus !== 'COMPLETED' && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={message.jobStatus} 
              color={message.jobStatus === 'FAILED' ? 'error' : 'info'}
              size="small" 
            />
            {message.progress && (
              <Typography variant="caption" color="text.secondary">
                {message.progress}
              </Typography>
            )}
          </Box>
        )}

        {/* Sources section for assistant messages */}
        {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
          <Paper 
            elevation={1} 
            sx={{ 
              mt: 2, 
              p: 2, 
              backgroundColor: 'grey.50',
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              📚 Sources:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {message.sources.map((source, index) => (
                <Typography 
                  key={index} 
                  variant="body2" 
                  component="a"
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {source}
                </Typography>
              ))}
            </Box>
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onSendMessage,
  loading,
  selectedTopicId,
  processingStatus,
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
            maxWidth: 500,
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
          <Typography variant="body1" color="text.secondary" paragraph>
            Start a new conversation to ask questions about Luxembourg financial regulations and CSSF documentation.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            💡 Try asking: "Compare CSSF circular 16/635 and 12/539" for detailed analysis
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
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Start the conversation by asking a question...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Examples: "What are the risk management requirements?" or "Compare circular 16/635 and 12/539"
              </Typography>
            </Paper>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <EnhancedChatMessage key={message.id} message={message} />
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