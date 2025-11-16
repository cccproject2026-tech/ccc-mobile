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
    profileComplete: boolean; // NEW
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
    completeProfile: () => Promise<void>; // NEW
    clearError: () => void;
    resetAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This hook protects routes based on authentication
function useProtectedRoute(user: User | null, isLoading: boolean, profileComplete: boolean) {
    const segments = useSegments();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        const inRootIndex = pathname === '/';
        const inAuthGroup = segments[0] === '(login)';
        const inPastorGroup = segments[0] === '(pastor)';
        const inMentorGroup = segments[0] === '(mentor-tabs)';
        const inDirectorGroup = segments[0] === '(director)';
        const inProfileSetup = pathname === '/(login)/profile';

        console.log('Current segments:', segments);
        console.log('Is authenticated:', !!user);
        console.log('Profile complete:', profileComplete);
        console.log('Pathname:', pathname);

        // Allow root index page for role selection (public)
        if (inRootIndex) {
            return;
        }

        // Mentor and Director groups are public (no auth required for testing)
        if (inMentorGroup || inDirectorGroup) {
            console.log('In mentor/director group - no auth required');
            return;
        }

        // If authenticated but profile not complete, redirect to profile setup
        if (user && user.role === 'pastor' && !profileComplete && !inProfileSetup) {
            console.log('📝 Profile incomplete, redirecting to profile setup');
            router.replace('/(login)/profile');
            return;
        }

        // Only protect pastor routes with authentication
        if (inPastorGroup) {
            if (!user || user.role !== 'pastor') {
                console.log('Redirecting to login - pastor auth required');
                router.replace('/(login)');
                return;
            }

            // If authenticated pastor but profile not complete, redirect to profile
            if (!profileComplete && !inProfileSetup) {
                console.log('Profile not complete, redirecting to profile setup');
                router.replace('/(login)/profile');
                return;
            }
        }

        // If user is not signed in and trying to access login group
        if (!user && inAuthGroup) {
            // Allow access to login group (public)
            return;
        }

        // If user (pastor) is signed in with complete profile and on auth pages, redirect to their dashboard
        if (user && user.role === 'pastor' && profileComplete && inAuthGroup && !inProfileSetup) {
            console.log('Redirecting to pastor dashboard - user already authenticated with complete profile');
            router.replace('/(pastor)/(tabs)');
        }
    }, [user, segments, isLoading, pathname, profileComplete]);
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
        profileComplete: false, // NEW
    });

    // Use the protected route hook
    useProtectedRoute(state.user, state.isLoading, state.profileComplete);

    // Initialize auth state from AsyncStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
                const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
                const storedInterestStatus = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_STATUS);
                const storedInterestData = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_DATA);
                const storedPasswordSet = await AsyncStorage.getItem(STORAGE_KEYS.PASSWORD_SET);
                const storedProfileComplete = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE_COMPLETE); // NEW

                console.log('Initializing auth:', {
                    hasUser: !!storedUser,
                    hasToken: !!storedToken,
                    interestStatus: storedInterestStatus,
                    passwordSet: storedPasswordSet,
                    profileComplete: storedProfileComplete, // NEW
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
                        passwordSet: storedPasswordSet === 'true',
                        profileComplete: storedProfileComplete === 'true', // NEW
                    });
                } else {
                    setState(prev => ({
                        ...prev,
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        interestStatus: (storedInterestStatus as InterestStatus) || 'none',
                        interestData: storedInterestData ? JSON.parse(storedInterestData) : null,
                        passwordSet: storedPasswordSet === 'true',
                        profileComplete: false, // NEW
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
                    profileComplete: false, // NEW
                });
            }
        };

        initializeAuth();
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await mockApiDelay(800);

            const storedData = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_DATA);
            const storedStatus = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_STATUS);
            const storedPasswordSet = await AsyncStorage.getItem(STORAGE_KEYS.PASSWORD_SET);

            if (!storedData || storedStatus !== 'approved' || storedPasswordSet !== 'true') {
                throw new Error('Account not found or not approved yet');
            }

            const userData = JSON.parse(storedData) as InterestFormData & { password?: string };

            if (userData.email !== email) {
                throw new Error('Invalid email or password');
            }

            if (!userData.password || userData.password !== password) {
                throw new Error('Invalid email or password');
            }

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

            // Check profile complete status
            const profileComplete = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE_COMPLETE);

            console.log('Login successful:', user);

            setState(prev => ({
                ...prev,
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                profileComplete: profileComplete === 'true', // NEW
            }));
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

            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

            console.log('✅ Logout successful - auth cleared');

            setState(prev => ({
                ...prev,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                profileComplete: false, // Reset on logout
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

            await AsyncStorage.setItem(STORAGE_KEYS.INTEREST_DATA, JSON.stringify(submittedData));
            await AsyncStorage.setItem(STORAGE_KEYS.INTEREST_STATUS, 'pending');

            console.log('Interest form submitted:', submittedData);

            setState(prev => ({
                ...prev,
                isLoading: false,
                interestStatus: 'pending',
                interestData: submittedData,
            }));
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
        } catch (error) {
            console.error('Failed to check interest status:', error);
            return 'none';
        }
    };

    const verifyEmail = async (email: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await mockApiDelay(500);

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

            const storedData = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_DATA);
            if (storedData) {
                const data = JSON.parse(storedData) as InterestFormData;
                const updatedData = { ...data, password };
                await AsyncStorage.setItem(STORAGE_KEYS.INTEREST_DATA, JSON.stringify(updatedData));
            }

            await AsyncStorage.setItem(STORAGE_KEYS.PASSWORD_SET, 'true');

            console.log('Password set successfully for:', email);

            setState(prev => ({
                ...prev,
                isLoading: false,
                passwordSet: true,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to set password'
            }));
            throw error;
        }
    };

    const mockApproveInterest = async (): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await mockApiDelay(800);

            await AsyncStorage.setItem(STORAGE_KEYS.INTEREST_STATUS, 'approved');
            await AsyncStorage.setItem(STORAGE_KEYS.PASSWORD_SET, 'false');

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

    const resetPassword = async (email: string, newPassword: string): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await mockApiDelay(1000);

            const storedData = await AsyncStorage.getItem(STORAGE_KEYS.INTEREST_DATA);
            if (storedData) {
                const data = JSON.parse(storedData) as InterestFormData & { password?: string };

                if (data.email === email) {
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

    // NEW - Complete profile function
    const completeProfile = async (): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await mockApiDelay(500);

            await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_COMPLETE, 'true');

            console.log('✅ Profile marked as complete');

            setState(prev => ({
                ...prev,
                isLoading: false,
                profileComplete: true,
            }));
        } catch (error) {
            console.error('Failed to mark profile as complete:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to complete profile'
            }));
            throw error;
        }
    };

    const clearError = () => {
        setState(prev => ({ ...prev, error: null }));
    };

    const resetAuth = async () => {
        try {
            // Clear ALL auth-related storage
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.AUTH_USER,
                STORAGE_KEYS.AUTH_TOKEN,
                STORAGE_KEYS.INTEREST_STATUS,
                STORAGE_KEYS.INTEREST_DATA,
                STORAGE_KEYS.PASSWORD_SET,
                STORAGE_KEYS.PROFILE_COMPLETE,
            ]);

            console.log('✅ AsyncStorage cleared successfully');

            // Reset state to initial values
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                interestStatus: 'none',
                interestData: null,
                passwordSet: false,
                profileComplete: false,
            });

            console.log('✅ Auth context reset to initial state');
        } catch (error) {
            console.error('❌ Failed to clear AsyncStorage:', error);
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
        resetPassword,
        completeProfile, // NEW
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
