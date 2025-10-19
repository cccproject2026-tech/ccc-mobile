import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device size categories
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;

// Platform detection
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Responsive scaling functions
export const scale = (size: number): number => {
    const baseWidth = 375; // iPhone X width as base
    return (SCREEN_WIDTH / baseWidth) * size;
};

export const verticalScale = (size: number): number => {
    const baseHeight = 812; // iPhone X height as base
    return (SCREEN_HEIGHT / baseHeight) * size;
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
    return size + (scale(size) - size) * factor;
};

// Platform-specific scaling
export const platformScale = (iosSize: number, androidSize: number): number => {
    return isIOS ? iosSize : androidSize;
};

// Responsive font sizes
export const getFontSize = (baseSize: number): number => {
    if (isAndroid) {
        // Android tends to render fonts larger, so reduce by 15-20%
        return moderateScale(baseSize * 0.85, 0.3);
    }
    return moderateScale(baseSize, 0.3);
};

// Responsive spacing
export const getSpacing = (baseSpacing: number): number => {
    if (isAndroid) {
        // Reduce spacing more on Android to make things more compact
        return moderateScale(baseSpacing * 0.8, 0.3);
    }
    return moderateScale(baseSpacing, 0.3);
};

// Responsive image sizes
export const getImageSize = (baseSize: number): number => {
    if (isAndroid) {
        return moderateScale(baseSize * 0.85, 0.3);
    }
    return moderateScale(baseSize, 0.3);
};

// Button heights
export const getButtonHeight = (baseHeight: number): number => {
    if (isAndroid) {
        return moderateScale(baseHeight * 0.8, 0.3);
    }
    return moderateScale(baseHeight, 0.3);
};

// Icon sizes
export const getIconSize = (baseSize: number): number => {
    if (isAndroid) {
        return Math.round(baseSize * 0.85);
    }
    return Math.round(baseSize * 0.9);
};

// Device type helper
export const getDeviceType = () => {
    if (isSmallDevice) return 'small';
    if (isMediumDevice) return 'medium';
    return 'large';
};

// Responsive card sizes
export const getCardImageSize = (): number => {
    const baseSize = SCREEN_WIDTH * 0.25; // Reduced from 0.28
    if (isAndroid) {
        return baseSize * 0.8; // Make images smaller on Android
    }
    return baseSize;
};

// List item heights
export const getListItemHeight = (): number => {
    if (isAndroid) {
        return isSmallDevice ? 50 : 55; // Reduced heights
    }
    return isSmallDevice ? 58 : 65; // Reduced heights
};