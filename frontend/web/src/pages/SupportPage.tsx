import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Link,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { SupportForm } from '../components/SupportForm';
import { getSupportInfo, SupportInfo } from '../api/Support';
import { colors } from '../../theme/palette';

export const SupportPage = () => {
  const [info, setInfo] = useState<SupportInfo | null>(null);
  const [infoError, setInfoError] = useState('');

  useEffect(() => {
    getSupportInfo()
      .then(setInfo)
      .catch(() => setInfoError('Could not load support details. You can still submit the form below.'));
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        py: 4,
        px: 2,
        background: `linear-gradient(135deg, ${colors.seashell} 0%, rgba(255, 169, 135, 0.1) 100%)`,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 720 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.strawberryRed, mb: 1 }}>
          Manager support
        </Typography>
        <Typography variant="body1" sx={{ color: colors.carbonBlack, opacity: 0.75, mb: 3 }}>
          Request a new manager account, report an access issue, or ask our team for help.
        </Typography>

        {infoError && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px' }}>
            {infoError}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3, borderRadius: '20px', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Manager onboarding
          </Typography>
          <Stepper orientation="vertical" activeStep={-1}>
            {(info?.onboarding_steps ?? [
              'Submit a support request with your work email and restaurant name.',
              'Our team reviews the request and creates your manager account.',
              'You receive login credentials at the email address you provided.',
              'Sign in at the manager dashboard to manage tables, QR codes, and forecasts.',
            ]).map((step, index) => (
              <Step key={step} expanded active>
                <StepLabel>{`Step ${index + 1}`}</StepLabel>
                <StepContent>
                  <Typography variant="body2" sx={{ color: 'text.secondary', pb: 2 }}>
                    {step}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          {info?.contact_email && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Prefer email? Contact us at{' '}
              <Link href={`mailto:${info.contact_email}`} sx={{ color: colors.strawberryRed, fontWeight: 600 }}>
                {info.contact_email}
              </Link>
            </Typography>
          )}
        </Paper>

        <Paper elevation={3} sx={{ p: 3, borderRadius: '20px' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Support request
          </Typography>
          <SupportForm />
        </Paper>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, opacity: 0.7 }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/auth" sx={{ color: colors.strawberryRed, fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
