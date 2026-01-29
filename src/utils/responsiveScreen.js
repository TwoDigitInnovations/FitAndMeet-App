
import { Dimensions, PixelRatio } from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const wp = (value) => {
    return PixelRatio.roundToNearestPixel((screenWidth * value) / 100);
};
const hp = (value) => {
    return PixelRatio.roundToNearestPixel((screenHeight * value) / 100);
};

const guidelineBaseWidth = 375; // base width (iPhone X/11/12 standard)
const guidelineBaseHeight = 812;

const scale = screenWidth / guidelineBaseWidth;

const RF = (size) => {
    return PixelRatio.roundToNearestPixel(size * scale);
};

const FontSizes = {
    xs: RF(10),
    sm: RF(12),
    md: RF(14),
    lg: RF(16),
    xl: RF(18),
    xxl: RF(20),
};



// scale functions
const scaleWidth = screenWidth / guidelineBaseWidth;
const scaleHeight = screenHeight / guidelineBaseHeight;

const wpPx = (px) => {
    return PixelRatio.roundToNearestPixel(px * scaleWidth);
};

const hpPx = (px) => {
    return PixelRatio.roundToNearestPixel(px * scaleHeight);
};

export { wp, hp, RF, FontSizes, wpPx, hpPx };