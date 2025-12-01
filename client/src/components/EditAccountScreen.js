import { useContext, useState, useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import AuthContext from '../auth';

import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    InputAdornment,
    Avatar
} from '@mui/material';
import {
    LockOutlined as LockOutlinedIcon,
    Clear as ClearIcon,
    Home as HomeIcon,
    Person as PersonIcon
} from '@mui/icons-material';

/*
    Edit Account Screen - Use Case 2.3
    
    Per specification (Figure 3.4):
    - Similar to Create Account screen
    - User may NOT change email (display only)
    - User may change: userName, password, avatar
    - Password change requires entering twice
    - Complete button disabled until all valid
    - Cancel button returns to previous screen
    - Validation: passwords match, min 8 chars, avatar 100x100px
    
    @author Gatik Yadav
*/

export default function EditAccountScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();
    const fileInputRef = useRef(null);

    // Required avatar dimensions
    const AVATAR_WIDTH = 100;
    const AVATAR_HEIGHT = 100;

    // Store the previous location to return to after editing
    const [previousPath] = useState(() => {
        // Default to home if no referrer
        return document.referrer ? '/' : '/';
    });

    // Form state - pre-populate with current user data
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        passwordConfirm: ''
    });

    // Avatar image state
    const [avatarImage, setAvatarImage] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarChanged, setAvatarChanged] = useState(false);

    // Error state
    const [errors, setErrors] = useState({
        userName: '',
        password: '',
        passwordConfirm: '',
        avatar: ''
    });

    // Track if password is being changed
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Load current user data on mount
    useEffect(() => {
        if (auth.user) {
            setFormData(prev => ({
                ...prev,
                userName: auth.user.userName || '',
                email: auth.user.email || ''
            }));
            // Set current avatar
            if (auth.user.avatarImage) {
                setAvatarPreview(auth.user.avatarImage);
                setAvatarImage(auth.user.avatarImage);
            }
        }
    }, [auth.user]);

    const handleInputChange = (field) => (event) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Track if user is trying to change password
        if (field === 'password' || field === 'passwordConfirm') {
            setIsChangingPassword(value.length > 0 || 
                (field === 'password' ? formData.passwordConfirm.length > 0 : formData.password.length > 0));
        }

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }

        // Real-time validation
        validateField(field, value);
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
        
        if (field === 'password' || field === 'passwordConfirm') {
            // Check if other password field is also empty
            const otherField = field === 'password' ? 'passwordConfirm' : 'password';
            if (formData[otherField] === '') {
                setIsChangingPassword(false);
            }
        }
    };

    const validateField = (field, value) => {
        let error = '';

        switch (field) {
            case 'userName':
                if (value && value.trim() === '') {
                    error = 'User name cannot be only whitespace';
                }
                break;
            case 'password':
                // Only validate if user is changing password
                if (value && value.length < 8) {
                    error = 'Password must be at least 8 characters';
                }
                // Also check password confirm if it has a value
                if (formData.passwordConfirm && value !== formData.passwordConfirm) {
                    setErrors(prev => ({
                        ...prev,
                        passwordConfirm: 'Passwords do not match'
                    }));
                } else if (formData.passwordConfirm) {
                    setErrors(prev => ({
                        ...prev,
                        passwordConfirm: ''
                    }));
                }
                break;
            case 'passwordConfirm':
                if (value && value !== formData.password) {
                    error = 'Passwords do not match';
                }
                break;
            default:
                break;
        }

        if (error) {
            setErrors(prev => ({
                ...prev,
                [field]: error
            }));
        }
    };

    const handleAvatarSelect = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check if it's an image
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    avatar: 'Please select an image file'
                }));
                return;
            }

            // Create image to check dimensions
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.onload = () => {
                    // Check dimensions
                    if (img.width !== AVATAR_WIDTH || img.height !== AVATAR_HEIGHT) {
                        setErrors(prev => ({
                            ...prev,
                            avatar: `Image must be exactly ${AVATAR_WIDTH}x${AVATAR_HEIGHT} pixels`
                        }));
                        return;
                    }

                    // Valid image - store as base64 string
                    setAvatarImage(e.target.result);
                    setAvatarPreview(e.target.result);
                    setAvatarChanged(true);
                    setErrors(prev => ({
                        ...prev,
                        avatar: ''
                    }));
                };
                img.src = e.target.result;
            };

            reader.readAsDataURL(file);
        }
    };

    // Check if form is valid for submission
    const isFormValid = () => {
        // userName is required and cannot be whitespace
        if (!formData.userName.trim()) {
            return false;
        }

        // Check no errors exist
        if (Object.values(errors).some(error => error !== '')) {
            return false;
        }

        // If changing password, both fields must be valid
        if (isChangingPassword) {
            if (!formData.password || formData.password.length < 8) {
                return false;
            }
            if (formData.password !== formData.passwordConfirm) {
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isFormValid()) {
            return;
        }

        // Build update data
        const updateData = {
            userName: formData.userName.trim()
        };

        // Only include password if changing
        if (isChangingPassword && formData.password) {
            updateData.password = formData.password;
            updateData.passwordVerify = formData.passwordConfirm;
        }

        // Only include avatar if changed
        if (avatarChanged) {
            updateData.avatarImage = avatarImage;
        }

        // Update the user
        const result = await auth.updateUser(updateData);

        if (result.success) {
            // Return to previous screen
            history.goBack();
        } else {
            // Show error
            if (result.error) {
                setErrors(prev => ({
                    ...prev,
                    userName: result.error
                }));
            }
        }
    };

    const handleCancel = () => {
        // Return to previous screen without saving
        history.goBack();
    };

    const handleHomeClick = () => {
        history.push('/');
    };

    // Get user's avatar for header display
    const getUserAvatar = () => {
        if (avatarPreview) {
            return avatarPreview;
        }
        return null;
    };

    const getUserInitials = () => {
        if (formData.userName) {
            return formData.userName.substring(0, 2).toUpperCase();
        }
        return '';
    };

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
                
                {/* Show user's avatar in header */}
                <Avatar
                    src={getUserAvatar()}
                    sx={{ 
                        width: 36, 
                        height: 36,
                        bgcolor: getUserAvatar() ? 'transparent' : '#fff',
                        color: '#e020a0'
                    }}
                >
                    {!getUserAvatar() && getUserInitials()}
                </Avatar>
            </Box>

            {/* Main Content */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pt: 4
            }}>
                {/* Form Container - Cream background */}
                <Box sx={{
                    bgcolor: '#f5f5dc',
                    borderRadius: 2,
                    p: 4,
                    width: '100%',
                    maxWidth: '500px',
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
                        Edit Account
                    </Typography>

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                        {/* Avatar + User Name Row */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                            {/* Avatar Selector */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Avatar
                                    src={avatarPreview}
                                    sx={{ 
                                        width: 56, 
                                        height: 56, 
                                        bgcolor: '#ddd',
                                        mb: 0.5
                                    }}
                                >
                                    {!avatarPreview && <PersonIcon />}
                                </Avatar>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleAvatarSelect}
                                    sx={{ 
                                        fontSize: '0.7rem',
                                        py: 0.25,
                                        px: 1,
                                        minWidth: 'auto',
                                        color: '#333',
                                        borderColor: '#333'
                                    }}
                                >
                                    Select
                                </Button>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        mt: 0.5, 
                                        color: '#666',
                                        textAlign: 'center',
                                        fontSize: '0.65rem'
                                    }}
                                >
                                    {AVATAR_WIDTH}x{AVATAR_HEIGHT}px
                                </Typography>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarChange}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                {errors.avatar && (
                                    <Typography 
                                        variant="caption" 
                                        color="error"
                                        sx={{ mt: 0.5, textAlign: 'center', maxWidth: 80 }}
                                    >
                                        {errors.avatar}
                                    </Typography>
                                )}
                            </Box>

                            {/* User Name Field */}
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label="User Name"
                                    value={formData.userName}
                                    onChange={handleInputChange('userName')}
                                    error={!!errors.userName}
                                    helperText={errors.userName}
                                    variant="standard"
                                    InputProps={{
                                        endAdornment: formData.userName && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={handleClearField('userName')}
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
                        </Box>

                        {/* Email Field - READ ONLY per spec */}
                        <Box sx={{ mb: 2, ml: 9 }}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.email}
                                variant="standard"
                                disabled
                                InputProps={{
                                    readOnly: true,
                                }}
                                helperText="Email cannot be changed"
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: '#666',
                                    }
                                }}
                            />
                        </Box>

                        {/* Password Field - Optional */}
                        <Box sx={{ mb: 2, ml: 9 }}>
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange('password')}
                                error={!!errors.password}
                                helperText={errors.password || 'Leave blank to keep current password'}
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

                        {/* Password Confirm Field - Only needed if changing password */}
                        <Box sx={{ mb: 3, ml: 9 }}>
                            <TextField
                                fullWidth
                                label="Password Confirm"
                                type="password"
                                value={formData.passwordConfirm}
                                onChange={handleInputChange('passwordConfirm')}
                                error={!!errors.passwordConfirm}
                                helperText={errors.passwordConfirm}
                                variant="standard"
                                disabled={!isChangingPassword}
                                InputProps={{
                                    endAdornment: formData.passwordConfirm && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={handleClearField('passwordConfirm')}
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

                        {/* Complete and Cancel Buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!isFormValid()}
                                sx={{
                                    bgcolor: '#333',
                                    color: 'white',
                                    px: 4,
                                    py: 1,
                                    borderRadius: 1,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    '&:hover': { bgcolor: '#555' },
                                    '&:disabled': { 
                                        bgcolor: '#ccc',
                                        color: '#888'
                                    }
                                }}
                            >
                                Complete
                            </Button>
                            <Button
                                type="button"
                                variant="contained"
                                onClick={handleCancel}
                                sx={{
                                    bgcolor: '#333',
                                    color: 'white',
                                    px: 4,
                                    py: 1,
                                    borderRadius: 1,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    '&:hover': { bgcolor: '#555' }
                                }}
                            >
                                Cancel
                            </Button>
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
        </Box>
    );
}