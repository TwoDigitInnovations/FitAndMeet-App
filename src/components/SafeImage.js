import React, {useState} from 'react';
import {Image} from 'react-native';

const SafeImage = ({source, fallbackSource, style, ...props}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (error) => {
    console.log('SafeImage error:', error);
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  
  const getImageSource = () => {
    if (hasError || !source) {
      return fallbackSource || require('../Assets/images/layout.png');
    }
    
   
    if (typeof source === 'string') {
      if (source === '' || source === 'null' || source === 'undefined') {
        return fallbackSource || require('../Assets/images/layout.png');
      }
      return {uri: source};
    }
    
  
    if (source && source.uri) {
      if (source.uri === '' || source.uri === 'null' || source.uri === 'undefined') {
        return fallbackSource || require('../Assets/images/layout.png');
      }
      return source;
    }
    
    return source || fallbackSource || require('../Assets/images/layout.png');
  };

  return (
    <Image
      source={getImageSource()}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default SafeImage;