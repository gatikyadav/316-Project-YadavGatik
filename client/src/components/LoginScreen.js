import { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import AuthContext from '../auth';
import GlobalStoreContext from '../store';

import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    InputAdornment,
    Modal
} from '@mui/material';
import {
    LockOutlined as LockOutlinedIcon,
    Clear as ClearIcon,
    Home as HomeIcon,
    AccountCircle as AccountCircleIcon
} from '@mui/icons-material';

/*
    Login Screen - Use Case 2.2
    
    Per specification (Figure 3.5):
    - Magenta header with home/account icons
    - Pink background, cream form area
    - Lock icon, "Sign In" title
    - Email and Password fields with clear (X) buttons
    - Dark "SIGN IN" button
    - Link to Create Account
    - Error feedback for incorrect credentials
    
    @author Gatik Yadav
*/

export default function LoginScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const history = useHistory();

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Error state
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    // Modal state for login failure
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (field) => (event) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleClearField = (field) => () => {
        setFormData(prev => ({
            ...prev,
            [field]: ''
        }));
        setErrors(prev => ({
            ...prev,
            [field]: ''
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        // Basic validation
        if (!formData.email || !formData.password) {
            if (!formData.email) {
                setErrors(prev => ({ ...prev, email: 'Email is required' }));
            }
            if (!formData.password) {
                setErrors(prev => ({ ...prev, password: 'Password is required' }));
            }
            return;
        }

        // Attempt login
        auth.loginUser({
            email: formData.email,
            password: formData.password
        }, store);
    };

    const handleHomeClick = () => {
        history.push('/');
    };

    const handleCloseErrorModal = () => {
        setShowErrorModal(false);
        setErrorMessage('');
    };

    // Check for auth error and show modal
    if (auth.errorMessage && !showErrorModal) {
        setErrorMessage(auth.errorMessage);
        setShowErrorModal(true);
        auth.clearError();
    }

    return (
        <Box sx={{ 
            minHeight: '100vh',
            bgcolor: '#f8e0f0' // Pink background
        }}>
            {/* Header Bar - Magenta */}
            <Box sx={{ 
                bgcolor: '#e020a0',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2
            }}>
                <IconButton 
                    onClick={handleHomeClick}
                    sx={{ 
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                >
                    <HomeIcon />
                </IconButton>
                <IconButton sx={{ color: 'white' }}>
                    <AccountCircleIcon sx={{ fontSize: 36 }} />
                </IconButton>
            </Box>

            {/* Main Content */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pt: 6
            }}>
                {/* Form Container - Cream background */}
                <Box sx={{
                    bgcolor: '#f5f5dc',
                    borderRadius: 2,
                    p: 4,
                    width: '100%',
                    maxWidth: '450px',
                    mx: 2
                }}>
                    {/* Lock Icon */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <LockOutlinedIcon sx={{ fontSize: 48, color: '#666' }} />
                    </Box>

                    {/* Title */}
                    <Typography 
                        variant="h4" 
                        align="center" 
                        sx={{ 
                            color: '#333',
                            mb: 4,
                            fontWeight: 400
                        }}
                    >
                        Sign In
                    </Typography>

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <Box sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                error={!!errors.email}
                                helperText={errors.email}
                                variant="standard"
                                autoFocus
                                InputProps={{
                                    endAdornment: formData.email && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={handleClearField('email')}
                                                sx={{ 
                                                    bgcolor: '#999',
                                                    color: 'white',
                                                    width: 20,
                                                    height: 20,
                                                    '&:hover': { bgcolor: '#777' }
                                                }}
                                            >
                                                <ClearIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>

                        {/* Password Field */}
                        <Box sx={{ mb: 4 }}>
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange('password')}
                                error={!!errors.password}
                                helperText={errors.password}
                                variant="standard"
                                InputProps={{
                                    endAdornment: formData.password && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={handleClearField('password')}
                                                sx={{ 
                                                    bgcolor: '#999',
                                                    color: 'white',
                                                    width: 20,
                                                    height: 20,
                                                    '&:hover': { bgcolor: '#777' }
                                                }}
                                            >
                                                <ClearIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>

                        {/* Sign In Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    bgcolor: '#333',
                                    color: 'white',
                                    px: 6,
                                    py: 1,
                                    borderRadius: 1,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    '&:hover': { bgcolor: '#555' }
                                }}
                            >
                                SIGN IN
                            </Button>
                        </Box>

                        {/* Sign Up Link */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Link 
                                to="/register/"
                                style={{ 
                                    color: '#e020a0',
                                    textDecoration: 'none',
                                    fontWeight: 'bold'
                                }}
                            >
                                Don't have an account? Sign Up
                            </Link>
                        </Box>
                    </Box>
                </Box>

                {/* Copyright */}
                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    align="center"
                    sx={{ mt: 4, mb: 2 }}
                >
                    Copyright © Playlister 2025
                </Typography>
            </Box>

            {/* Error Modal - Per spec: suitable feedback for incorrect credentials */}
            <Modal
                open={showErrorModal}
                onClose={handleCloseErrorModal}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 350,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 0,
                    overflow: 'hidden'
                }}>
                    {/* Modal Header */}
                    <Box sx={{ 
                        bgcolor: '#f44336', 
                        color: 'white', 
                        p: 2 
                    }}>
                        <Typography variant="h6">
                            Login Failed
                        </Typography>
                    </Box>
                    
                    {/* Modal Content */}
                    <Box sx={{ p: 3 }}>
                        <Typography sx={{ mb: 3 }}>
                            {errorMessage || 'Wrong email or password provided.'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                                onClick={handleCloseErrorModal}
                                variant="contained"
                                sx={{
                                    bgcolor: '#333',
                                    '&:hover': { bgcolor: '#555' }
                                }}
                            >
                                OK
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}