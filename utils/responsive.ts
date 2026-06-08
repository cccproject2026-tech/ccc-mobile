import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');


export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;


export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';


export const scale = (size: number): number => {
    const baseWidth = 375;
    return (SCREEN_WIDTH / baseWidth) * size;
};

export const verticalScale = (size: number): number => {
    const baseHeight = 812;
    return (SCREEN_HEIGHT / baseHeight) * size;
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
    return size + (scale(size) - size) * factor;
};


export const platformScale = (iosSize: number, androidSize: number): number => {
    return isIOS ? iosSize : androidSize;
};


export const getFontSize = (baseSize: number): number => {
    
    const safeBaseSize = typeof baseSize === 'number' && baseSize > 0 ? baseSize : 14;
    if (isAndroid) {
        return moderateScale(safeBaseSize * 0.85, 0.3);
    }
    return moderateScale(safeBaseSize, 0.3);
};





export const getImageSize = (baseSize: number): number => {
    if (isAndroid) {
        return moderateScale(baseSize * 0.85, 0.3);
    }
    return moderateScale(baseSize, 0.3);
};


export const getButtonHeight = (baseHeight: number): number => {
    if (isAndroid) {
        return moderateScale(baseHeight * 0.8, 0.3);
    }
    return moderateScale(baseHeight, 0.3);
};




export const getDeviceType = () => {
    if (isSmallDevice) return 'small';
    if (isMediumDevice) return 'medium';
    return 'large';
};


export const getCardImageSize = (): number => {
    const baseSize = SCREEN_WIDTH * 0.25;
    if (isAndroid) {
        return baseSize * 0.8;
    }
    return baseSize;
};

// List item heights - INCREASED for better Android visibility
export const getListItemHeight = (): number => {
    if (isAndroid) {
        return isSmallDevice ? 68 : 76;
    }
    return isSmallDevice ? 58 : 65;
};


export const getIconSize = (baseSize: number): number => {
    if (isAndroid) {
        return Math.round(baseSize * 0.95);
    }
    return Math.round(baseSize * 0.9);
};


export const getSpacing = (baseSpacing: number): number => {
    if (isAndroid) {
        return moderateScale(baseSpacing * 0.9, 0.3);
    }
    return moderateScale(baseSpacing, 0.3);
};
