import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import posthog from 'posthog-js';
import { colors } from '../../theme/palette';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by React ErrorBoundary:', error, errorInfo);
    // Send standard structured exception to PostHog
    posthog.captureException(error, {
      component_stack: errorInfo.componentStack,
      location: window.location.href,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: `linear-gradient(135deg, ${colors.seashell} 0%, rgba(255, 169, 135, 0.1) 100%)`,
            margin: 0,
            padding: 2,
          }}
        >
          <Container maxWidth="sm">
            <Paper
              elevation={3}
              sx={{
                padding: '48px 32px',
                borderRadius: '24px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(229, 75, 75, 0.1)',
                background: '#ffffff',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: colors.strawberryRed,
                  fontWeight: 800,
                  marginBottom: '16px',
                }}
              >
                Something Went Wrong
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: colors.carbonBlack,
                  opacity: 0.8,
                  marginBottom: '32px',
                  lineHeight: 1.6,
                }}
              >
                An unexpected error occurred in our system. The issue has been automatically reported to our engineering team, and we are working to resolve it.
              </Typography>
              <Button
                variant="contained"
                onClick={this.handleReset}
                sx={{
                  padding: '12px 32px',
                  borderRadius: '12px',
                  backgroundColor: colors.strawberryRed,
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#d63a3a',
                    boxShadow: '0 4px 12px rgba(229, 75, 75, 0.3)',
                  },
                }}
              >
                Return to Homepage
              </Button>
            </Paper>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}
