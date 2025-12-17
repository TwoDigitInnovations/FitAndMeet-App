import React, { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Constants, { FONTS } from '../utils/Constant';
import { wp } from '../utils/responsiveScreen';

const Spinner = (props) => {
  console.log(props)
  if (!props.isLoading) {
    return <></>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <ActivityIndicator
          size={wp(12)}
          animating={true}
          color={Constants.white}
        />
        <Text style={styles.title}>Loading...</Text>
      </View>
    </View>
  );
};

export default memo(Spinner);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '110%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000080', // 'transparent'
    zIndex: 9
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(2),
  },
  title: {
    fontSize: wp(5),
    fontFamily: FONTS.Heavy,
    color: Constants.white,
    marginTop: wp(2),
  },
});