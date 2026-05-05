import { useState } from 'react';
import { usePostHog } from '@posthog/react';
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../services/AuthProvider';
import { colors } from '../../theme/palette';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const posthog = usePostHog();

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            posthog.capture('login_success', { email });
        } catch (err: any) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.detail || (err.response?.status === 401 ? 'Invalid email or password' : 'Login failed. Please try again.');
            posthog.capture('login_failed', { email, error: errorMessage });
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (err.response?.status === 401) {
                setError('Invalid email or password');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

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
                padding: 0,
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: '420px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
            <Paper
                elevation={3}
                sx={{
                    padding: '48px 32px',
                    borderRadius: '24px',
                    width: '100%',
                    background: '#ffffff',
                    boxShadow: '0 8px 32px rgba(229, 75, 75, 0.1)',
                }}
            >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', marginBottom: '40px' }}>
                        <Typography
                            variant="h4"
                            sx={{
                                color: colors.strawberryRed,
                                fontWeight: 800,
                                marginBottom: '8px',
                            }}
                        >
                            Welcome Back
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: colors.carbonBlack,
                                opacity: 0.7,
                            }}
                        >
                            Sign in to your account
                        </Typography>
                    </Box>

                    {/* Error Message */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                marginBottom: '24px',
                                borderRadius: '12px',
                                backgroundColor: '#ffebee',
                                color: colors.strawberryRed,
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Login Form */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        {/* Email Field */}
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            margin="normal"
                            disabled={loading}
                            required
                            sx={{
                                marginBottom: '20px',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    '&:hover fieldset': {
                                        borderColor: colors.strawberryRed,
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.strawberryRed,
                                    },
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    opacity: 0.6,
                                },
                            }}
                        />

                        {/* Password Field */}
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            margin="normal"
                            disabled={loading}
                            required
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                            disabled={loading}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                marginBottom: '32px',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    '&:hover fieldset': {
                                        borderColor: colors.strawberryRed,
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.strawberryRed,
                                    },
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    opacity: 0.6,
                                },
                            }}
                        />

                        {/* Submit Button */}
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading || !email || !password}
                            sx={{
                                padding: '12px 24px',
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
                                '&:disabled': {
                                    backgroundColor: '#cccccc',
                                    color: '#666666',
                                },
                            }}
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                                    Signing in...
                                </Box>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </Box>

                    {/* Footer Info */}
                    <Box sx={{ textAlign: 'center', marginTop: '24px' }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: colors.carbonBlack,
                                opacity: 0.6,
                            }}
                        >
                            Don't have an account?{' '}
                            <Typography
                                component="span"
                                sx={{
                                    color: colors.strawberryRed,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Contact support
                            </Typography>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};
