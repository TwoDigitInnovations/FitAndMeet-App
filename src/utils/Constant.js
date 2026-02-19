// const devUrl = 'https://api.fitandmeet.com/';

//  const devUrl = 'http://10.0.2.2:5000/';  // Android Emulator (Backend runs on port 5000)
  const devUrl = 'http://192.168.1.4:5000/';  // Real Device

let apiUrl = devUrl;
export const Googlekey = 'AIzaSyBSJ4feXtXRl7L4BxOrMubz8fciujaMBTk';
export const Currency = '$';

const Constants = {
  baseUrl: apiUrl,
  mainTheme: '#5D1F3A',
  black: '#000000',
  customblack: '#1E1E1E',
  white: '#FFFFFF',
  customgrey: '#808080',
  saffron: '#FF3B6D',
  red: '#FF0000',
  light_red: '#462128',
  custom_green: '#01B763',
  custom_green2: '#00FF00',
  green: '#01B763',
  tabgrey: '#8B8B8B',
  customgrey2: '#A4A4A4',
  customgrey3: '#858080',
  customgrey4: '#F1F1F1',
  customgrey5: '#dedede',
  custom_blue: '#4EB0CF',
  light_blue2: '#cae8f1',
  light_blue3: '#eaf8ff',
  light_blue: '#74d7fa',
};

export const FONTS = {
  Regular: 'Urbanist-Regular',
  Bold: 'Urbanist-Bold',
  Medium: 'Urbanist-Medium',
  SemiBold: 'Urbanist-SemiBold',
  Heavy: 'Urbanist-ExtraBold',
};

export default Constants;
