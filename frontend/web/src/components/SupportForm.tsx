import { useState } from 'react';
import { usePostHog } from '@posthog/react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { colors } from '../../theme/palette';
import { submitSupportRequest, SupportRequestType } from '../api/Support';
import { getUserFacingErrorMessage } from '../services/errorReporting';

const REQUEST_TYPE_OPTIONS: { value: SupportRequestType; label: string }[] = [
  { value: 'account_creation', label: 'New manager account' },
  { value: 'access_issue', label: 'Access or permissions issue' },
  { value: 'general', label: 'General question' },
];

interface SupportFormProps {
  defaultRequestType?: SupportRequestType;
  defaultEmail?: string;
  compact?: boolean;
}

export const SupportForm = ({
  defaultRequestType = 'account_creation',
  defaultEmail = '',
  compact = false,
}: SupportFormProps) => {
  const posthog = usePostHog();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [restaurantName, setRestaurantName] = useState('');
  const [requestType, setRequestType] = useState<SupportRequestType>(defaultRequestType);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await submitSupportRequest({
        name: name.trim(),
        email: email.trim(),
        request_type: requestType,
        message: message.trim(),
        restaurant_name: restaurantName.trim() || undefined,
        source: 'web',
      });
      setSuccess(response.message);
      setMessage('');
      setRestaurantName('');
      posthog.capture('support_form_submitted', { request_type: requestType });
    } catch (err: unknown) {
      const detail = getUserFacingErrorMessage(err, 'Failed to send your request. Please try again.');
      setError(detail);
      posthog.capture('support_form_failed', { request_type: requestType, error: detail });
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    marginBottom: compact ? '16px' : '20px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '&:hover fieldset': { borderColor: colors.strawberryRed },
      '&.Mui-focused fieldset': { borderColor: colors.strawberryRed },
    },
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ marginBottom: 2, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ marginBottom: 2, borderRadius: '12px' }}>
          {success}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={loading}
        sx={fieldSx}
      />

      <TextField
        fullWidth
        label="Work email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
        sx={fieldSx}
      />

      <TextField
        fullWidth
        label="Restaurant name (optional)"
        value={restaurantName}
        onChange={(e) => setRestaurantName(e.target.value)}
        disabled={loading}
        sx={fieldSx}
      />

      <FormControl fullWidth required sx={fieldSx}>
        <InputLabel id="support-request-type-label">Request type</InputLabel>
        <Select
          labelId="support-request-type-label"
          label="Request type"
          value={requestType}
          onChange={(e) => setRequestType(e.target.value as SupportRequestType)}
          disabled={loading}
          sx={{ borderRadius: '12px' }}
        >
          {REQUEST_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="How can we help?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        multiline
        minRows={compact ? 3 : 4}
        disabled={loading}
        placeholder="Tell us about your restaurant and what access you need."
        sx={fieldSx}
      />

      <Button
        fullWidth
        type="submit"
        variant="contained"
        disabled={loading || !name.trim() || !email.trim() || message.trim().length < 10}
        sx={{
          padding: '12px 24px',
          borderRadius: '12px',
          backgroundColor: colors.strawberryRed,
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': { backgroundColor: '#d63a3a' },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} sx={{ color: '#fff' }} />
            Sending...
          </Box>
        ) : (
          'Send request'
        )}
      </Button>

      {!compact && (
        <Typography variant="body2" sx={{ marginTop: 2, color: colors.carbonBlack, opacity: 0.6 }}>
          We typically respond within 1–2 business days.
        </Typography>
      )}
    </Box>
  );
};
