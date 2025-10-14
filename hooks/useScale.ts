import { useWindowDimensions } from 'react-native';

export const useScale = () => {
    const { width, height } = useWindowDimensions();
    const guidelineBaseWidth = 375;
    const guidelineBaseHeight = 812;

    const scale = (size: number) => (width / guidelineBaseWidth) * size;
    const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
    const moderateScale = (size: number, factor = 0.5) =>
        size + (scale(size) - size) * factor;

    return { s: scale, vs: verticalScale, ms: moderateScale, width, height };
};
