import { mockApiDelay, User } from '@/lib/user/mock';
import { InterestFormData, InterestStatus, STORAGE_KEYS } from '@/lib/user/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePathname, useRouter, useSegments } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    interestStatus: InterestStatus;
    interestData: InterestFormData | null;
    passwordSet: boolean;

}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (userData: Partial<User>, password: string) => Promise<void>;
    updateProfile: (userData: Partial<User>) => Promise<void>;
    submitInterest: (interestData: InterestFormData) => Promise<void>;
    checkInterestStatus: (email: string) => Promise<InterestStatus>;
    mockApproveInterest: () => Promise<void>;
    setPassword: (email: string, password: string) => Promise<void>;
    verifyEmail: (email: string) => Promise<boolean>;
    resetPassword: (email: string, newPassword: string) => Promise<void>;
    clearError: () => void;
    resetAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


// This hook protects routes based on authentication
function useProtectedRoute(user: User | null, isLoading: boolean) {
    const segments = useSegments();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        const inRootIndex = pathname === '/';
        const inAuthGroup = segments[0] === '(login)';
        const inPastorGroup = segments[0] === '(pastor-tabs)';
        const inMentorGroup = segments[0] === '(mentor-tabs)';
        const inDirectorGroup = segments[0] === '(director-tabs)';

        console.log('Current segments:', segments);
        console.log('Is authenticated:', !!user);
        console.log('Pathname:', pathname);

        // Allow root index page for role selection (public)
        if (inRootIndex) {
            // If user is logged in, redirect them to their dashboard
            // if (user && user.role === 'pastor') {
            //     router.replace('/(pastor-tabs)/(tabs)');
            // } else if (user && user.role === 'mentor') {
            //     router.replace('/(mentor-tabs)');
            // } else if (user && user.role === 'director') {
            //     router.replace('/(director-tabs)/(tabs)');
            // }
            return;
        }

        // Mentor and Director groups are public (no auth required for testing)
        if (inMentorGroup || inDirectorGroup) {
            console.log('In mentor/director group - no auth required');
            return;
        }

        // Only protect pastor routes with authentication
        if (inPastorGroup) {
            if (!user || user.role !== 'pastor') {
                console.log('Redirecting to login - pastor auth required');
                router.replace('/(login)');
                return;
            }
        }

        // If user is not signed in and trying to access login group
        if (!user && inAuthGroup) {
            // Allow access to login group (public)
            return;
        }

        // If user (pastor) is signed in and on auth pages, redirect to their dashboard
        if (user && user.role === 'pastor' && inAuthGroup) {
            console.log('Redirecting to pastor dashboard - user already authenticated');
            router.replace('/(pastor-tabs)/(tabs)');
        }
    }, [user, segments, isLoading, pathname]);
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const router = useRouter();
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
        interestStatus: 'none',
        interestData: null,
        passwordSet: false,
    });

    // Use the protected route hook
    useProtectedRoute(state.user, state.isLoading);

    // Initialize auth state from AsyncStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
                const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
                const storedInterestStatus = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_STATUS);
                const storedInterestData = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_DATA);
                const storedPasswordSet = await AsyncStorage.getItem(STORAGE_KEYS.PASSWORD_SET);

                console.log('Initializing auth:', {
                    hasUser: !!storedUser,
                    hasToken: !!storedToken,
                    interestStatus: storedInterestStatus,
                    passwordSet: storedPasswordSet,
                });

                if (storedUser && storedToken) {
                    const user = JSON.parse(storedUser) as User;
                    setState({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                        interestStatus: (storedInterestStatus as InterestStatus) || 'none',
                        interestData: storedInterestData ? JSON.parse(storedInterestData) : null,
                        passwordSet: storedPasswordSet === 'true', // ✅
                    });
                } else {
                    // User not logged in, but might have interest data
                    setState(prev => ({
                        ...prev,
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        interestStatus: (storedInterestStatus as InterestStatus) || 'none',
                        interestData: storedInterestData ? JSON.parse(storedInterestData) : null,
                        passwordSet: storedPasswordSet === 'true', // ✅ Check this even when logged out
                    }));
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                setState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: 'Failed to initialize authentication',
                    interestStatus: 'none',
                    interestData: null,
                    passwordSet: false,
                });
            }
        };

        initializeAuth();
    }, []);


    const login = async (email: string, password: string): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await mockApiDelay(800);

            // Check if user has approved interest with password
            const storedData = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_DATA);
            const storedStatus = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_STATUS);
            const storedPasswordSet = await AsyncStorage.getItem(STORAGE_KEYS.PASSWORD_SET);

            if (!storedData || storedStatus !== 'approved' || storedPasswordSet !== 'true') {
                throw new Error('Account not found or not approved yet');
            }

            const userData = JSON.parse(storedData) as InterestFormData & { password?: string };

            // Verify email and password
            if (userData.email !== email) {
                throw new Error('Invalid email or password');
            }

            if (!userData.password || userData.password !== password) {
                throw new Error('Invalid email or password');
            }

            // Create user object
            const user: User = {
                id: `user_${Date.now()}`,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phoneNumber: userData.phoneNumber,
                role: 'pastor',
            };

            const mockToken = `mock_jwt_token_${Date.now()}`;

            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);

            console.log('Login successful:', user);

            setState(prev => ({
                ...prev,
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            }));

            /* PRODUCTION VERSION:
                        * 
                        * const response = await fetch('https://api.example.com/auth/login', {
                        *   method: 'POST',
                        *   headers: { 'Content-Type': 'application/json' },
                        *   body: JSON.stringify({ email, password })
                        * });
                        * 
                        * if (!response.ok) {
                        *   const error = await response.json();
                        *   throw new Error(error.message || 'Authentication failed');
                        * }
                        * 
                        * const { user, token, interestStatus } = await response.json();
                        * 
                        * if (interestStatus === 'pending') {
                        *   throw new Error('Your account is still pending approval');
                        * }
                        * 
                        * await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
                        * await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
                        * 
                        * setState(prev => ({
                        *   ...prev,
                        *   user,
                        *   isAuthenticated: true,
                        *   isLoading: false,
                        *   error: null,
                        * }));
                        */
        } catch (error) {
            console.error('Login failed:', error);
            setState(prev => ({
                ...prev,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Login failed'
            }));
            throw error;
        }
    };
    const logout = async (): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            await mockApiDelay(500);

            // Only clear auth-related storage
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

            console.log('✅ Logout successful - auth cleared');

            // Reset ONLY auth fields, preserve everything else
            setState(prev => ({
                ...prev,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                // DON'T RESET THESE - keep them from prev state:
                // interestStatus: prev.interestStatus (stays "approved")
                // interestData: prev.interestData (stays)
                // passwordSet: prev.passwordSet (stays true)
            }));

        } catch (error) {
            console.error('Logout failed:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Logout failed'
            }));
            throw error;
        }
    };


    const register = async (userData: Partial<User>, password: string): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await mockApiDelay(1000);

            const newUser: User = {
                id: `user_${Date.now()}`,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phoneNumber: userData.phoneNumber || '',
                role: 'pastor',
                ...userData
            };

            const mockToken = `mock_jwt_token_${Date.now()}`;

            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(newUser));
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);

            setState(prev => ({
                ...prev,
                user: newUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Registration failed'
            }));
            throw error;
        }
    };

    const updateProfile = async (userData: Partial<User>): Promise<void> => {
        if (!state.user) {
            throw new Error('No authenticated user');
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await mockApiDelay(800);

            const updatedUser = { ...state.user, ...userData };

            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedUser));

            setState(prev => ({
                ...prev,
                user: updatedUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Profile update failed'
            }));
            throw error;
        }
    };

    const submitInterest = async (interestData: InterestFormData): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await mockApiDelay(1200);

            const submittedData: InterestFormData = {
                ...interestData,
                submittedAt: new Date().toISOString(),
                status: 'pending',
            };

            // Store interest data and status
            await AsyncStorage.setItem(STORAGE_KEYS.INTEREST_DATA, JSON.stringify(submittedData));
            await AsyncStorage.setItem(STORAGE_KEYS.INTEREST_STATUS, 'pending');

            console.log('Interest form submitted:', submittedData);
            console.log('Status set to: pending');

            setState(prev => ({
                ...prev,
                isLoading: false,
                interestStatus: 'pending',
                interestData: submittedData,
            }));

            /* PRODUCTION VERSION:
             * 
             * const response = await fetch('https://api.example.com/interest', {
             *   method: 'POST',
             *   headers: { 
             *     'Content-Type': 'application/json'
             *   },
             *   body: JSON.stringify(interestData)
             * });
             * 
             * if (!response.ok) {
             *   throw new Error('Failed to submit interest form');
             * }
             * 
             * const result = await response.json();
             * 
             * await AsyncStorage.setItem(STORAGE_KEYS.INTEREST_DATA, JSON.stringify(result.data));
             * await AsyncStorage.setItem(STORAGE_KEYS.INTEREST_STATUS, result.status);
             * 
             * setState(prev => ({ 
             *   ...prev, 
             *   isLoading: false,
             *   interestStatus: result.status,
             *   interestData: result.data,
             * }));
             */
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to submit interest form'
            }));
            throw error;
        }
    };

    const checkInterestStatus = async (email: string): Promise<InterestStatus> => {
        try {
            const storedStatus = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_STATUS);
            const storedData = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_DATA);

            if (storedData) {
                const data = JSON.parse(storedData) as InterestFormData;
                if (data.email === email) {
                    return (storedStatus as InterestStatus) || 'none';
                }
            }

            return 'none';

            /* PRODUCTION VERSION:
             * 
             * const response = await fetch(`https://api.example.com/interest/status?email=${email}`);
             * const { status } = await response.json();
             * return status;
             */
        } catch (error) {
            console.error('Failed to check interest status:', error);
            return 'none';
        }
    };

    const verifyEmail = async (email: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await mockApiDelay(500);

            // Check if email exists in submitted interest data
            const storedData = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_DATA);
            if (storedData) {
                const data = JSON.parse(storedData) as InterestFormData;
                if (data.email === email) {
                    setState(prev => ({ ...prev, isLoading: false }));
                    return true;
                }
            }

            setState(prev => ({ ...prev, isLoading: false }));
            return false;

            /* PRODUCTION VERSION:
             * 
             * const response = await fetch(`https://api.example.com/verify-email?email=${email}`);
             * const { exists, approved } = await response.json();
             * return exists && approved;
             */
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to verify email'
            }));
            return false;
        }
    };

    const setPassword = async (email: string, password: string): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await mockApiDelay(1000);

            // Store password in interest data for login verification
            const storedData = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_DATA);
            if (storedData) {
                const data = JSON.parse(storedData) as InterestFormData;
                // Add password to the stored data
                const updatedData = { ...data, password };
                await AsyncStorage.setItem(STORAGE_KEYS.INTEREST_DATA, JSON.stringify(updatedData));
            }

            // Mark password as set
            await AsyncStorage.setItem(STORAGE_KEYS.PASSWORD_SET, 'true');

            console.log('Password set successfully for:', email);

            setState(prev => ({
                ...prev,
                isLoading: false,
                passwordSet: true,
            }));

            /* PRODUCTION VERSION:
             * 
             * const response = await fetch('https://api.example.com/set-password', {
             *   method: 'POST',
             *   headers: { 'Content-Type': 'application/json' },
             *   body: JSON.stringify({ email, password })
             * });
             */
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to set password'
            }));
            throw error;
        }
    };

    // Update mockApproveInterest to reset password status
    const mockApproveInterest = async (): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await mockApiDelay(800);

            await AsyncStorage.setItem(STORAGE_KEYS.INTEREST_STATUS, 'approved');
            await AsyncStorage.setItem(STORAGE_KEYS.PASSWORD_SET, 'false'); // Reset password

            console.log('Interest approved! User needs to set password.');

            setState(prev => ({
                ...prev,
                interestStatus: 'approved',
                passwordSet: false,
                isLoading: false,
            }));

            Alert.alert(
                'Approved! 🎉',
                'Your application has been approved. Please set your password to login.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Failed to approve:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to approve interest'
            }));
            Alert.alert('Error', 'Failed to approve application. Please try again.');
        }
    };

    const clearError = () => {
        setState(prev => ({ ...prev, error: null }));
    };

    const resetAuth = () => {
        setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            interestStatus: 'none',
            interestData: null,
            passwordSet: false,
        });
        console.log('✅ Auth context reset to initial state');
    };


    const resetPassword = async (email: string, newPassword: string): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await mockApiDelay(1000);

            // Update password in stored interest data
            const storedData = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_DATA);
            if (storedData) {
                const data = JSON.parse(storedData) as InterestFormData & { password?: string };

                // Verify email matches
                if (data.email === email) {
                    // Update password
                    const updatedData = { ...data, password: newPassword };
                    await AsyncStorage.setItem(STORAGE_KEYS.INTEREST_DATA, JSON.stringify(updatedData));

                    console.log('✅ Password reset successfully for:', email);

                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        interestData: updatedData,
                    }));

                    return;
                } else {
                    throw new Error('Email does not match stored data');
                }
            } else {
                throw new Error('No account found with this email');
            }

            /* PRODUCTION VERSION:
             * 
             * const response = await fetch('https://api.example.com/reset-password', {
             *   method: 'POST',
             *   headers: { 'Content-Type': 'application/json' },
             *   body: JSON.stringify({ email, newPassword })
             * });
             * 
             * if (!response.ok) {
             *   throw new Error('Failed to reset password');
             * }
             */
        } catch (error) {
            console.error('Reset password failed:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to reset password'
            }));
            throw error;
        }
    };

    const value: AuthContextType = {
        ...state,
        login,
        logout,
        register,
        updateProfile,
        submitInterest,
        checkInterestStatus,
        mockApproveInterest,
        setPassword,
        verifyEmail,
        clearError,
        resetAuth,
        resetPassword
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
