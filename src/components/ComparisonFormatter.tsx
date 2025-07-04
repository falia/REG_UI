// ComparisonFormatter.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Alert,
} from '@mui/material';
import {
  CompareArrows,
  Timeline,
  Business,
  Recommend,
  Info,
} from '@mui/icons-material';

interface ComparisonData {
  purpose_and_scope: string;
  key_differences: string;
  timeline_and_amendments: string;
  institutional_impact: string;
  recommendations: string;
}

interface ComparisonFormatterProps {
  content: string;
  circular1?: string;
  circular2?: string;
}

export const ComparisonFormatter: React.FC<ComparisonFormatterProps> = ({
  content,
  circular1,
  circular2,
}) => {
  // Try to extract JSON from the content
  const extractComparisonData = (text: string): ComparisonData | null => {
    try {
      // Look for JSON structure in the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        if (jsonData.purpose_and_scope && jsonData.key_differences) {
          return jsonData;
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  // Extract circular numbers from content if not provided
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

  if (!comparisonData) {
    // Fallback to regular text display if it's not a structured comparison
    return (
      <Box>
        <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
          {content}
        </Typography>
      </Box>
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

// Hook to detect if content is a comparison result
export const useIsComparison = (content: string): boolean => {
  return content.includes('purpose_and_scope') && 
         content.includes('key_differences') && 
         (content.includes('CSSF') || content.includes('circular'));
};

// Enhanced Message component for ChatArea
interface EnhancedMessageProps {
  message: {
    content: string;
    role: 'user' | 'assistant';
    sources?: string[];
    circular1?: string;
    circular2?: string;
  };
}

export const EnhancedMessage: React.FC<EnhancedMessageProps> = ({ message }) => {
  const isComparison = useIsComparison(message.content);

  if (message.role === 'assistant' && isComparison) {
    return (
      <Box>
        <ComparisonFormatter 
          content={message.content}
          circular1={message.circular1}
          circular2={message.circular2}
        />
        {/* Sources section */}
        {message.sources && message.sources.length > 0 && (
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
      </Box>
    );
  }

  // Regular message display
  return (
    <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
      {message.content}
    </Typography>
  );
};