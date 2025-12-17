import { StyleSheet, Dimensions, Platform } from 'react-native';
import Constants, { FONTS } from '../../utils/Constant';
import { hp, wp, FontSizes, RF, hpPx, wpPx } from '../../utils/responsiveScreen'
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Constants.white,
        padding: wp(4),
    },
    headtxt: {
        fontSize: RF(36),
        color: Constants.black,
        fontFamily: FONTS.Bold,
        marginVertical: hp(1.2),
        marginBottom: hpPx(20),

    },
    headtxt1: {
        fontSize: RF(14),
        color: Constants.black,
        fontFamily: FONTS.Medium,
        marginVertical: hp(1.2),
        marginBottom: hpPx(20),
        paddingHorizontal: 20,
        textAlign: 'center'
    },
    titletext: {
        fontSize: RF(16),
        color: Constants.black,
        fontFamily: FONTS.SemiBold,
        marginTop: hp(1),
        marginLeft: wp(4)
    },
    proimg: {
        height: wpPx(100),
        width: wpPx(100),
        marginTop: hp(6)
    },
    proimg2: {
        height: hp(18),
        width: wp(40),
    },
    buttompart: {
        // justifyContent: 'center',
        alignItems: 'center',
    },
    inpcov: {
        borderWidth: 1.5,
        borderColor: Constants.black,
        width: wp(90),
        borderRadius: wp(10),
        height: hp(6),
        flexDirection: 'row',
        paddingHorizontal: wp(1.5),
        alignItems: 'center',
        marginTop: hp(1)
    },
    uploadcov: {
        borderWidth: 1.5,
        borderColor: Constants.custom_blue,
        backgroundColor: '#b9e0ec',
        borderRadius: wp(3),
        height: hp(6),
        marginTop: hp(2),
        width: wp(90),
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10
    },
    upltxt: {
        fontSize: 14,
        color: Constants.black,
        fontFamily: FONTS.Medium,
    },
    inputfield: {
        fontSize: 14,
        color: Constants.black,
        fontFamily: FONTS.Medium,
        flex: 1,
        paddingHorizontal: wp(3)
    },
    btncov: {
        width: wp(90),
        backgroundColor: Constants.black,
        borderRadius: wp(10),
        height: hp(6),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(2),
        boxShadow: '0px 1.5px 5px 0.1px grey'
    },

    btntxt: {
        fontSize: wp(4.5),
        color: Constants.white,
        fontFamily: FONTS.SemiBold
    },

    socialbtncov: {
        width: wp(90),
        backgroundColor: 'transparent',
        borderRadius: wp(10),
        height: hp(6),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(2),
        flexDirection: 'row',
        borderColor: Constants.black,
        borderWidth: 2,
        gap: wpPx(10)
        // boxShadow: '0px 1.5px 5px 0.1px grey'
    },
    socialbtntxt: {
        fontSize: wp(4.5),
        color: Constants.black,
        fontFamily: FONTS.SemiBold
    },
    forgtxt: {
        fontSize: RF(12),
        color: Constants.black,
        fontFamily: FONTS.Medium,
        marginTop: hp(1),
        textAlign: 'left',
        width: wp(80),
        fontStyle: 'italic'
    },
    require: {
        color: Constants.red,
        fontFamily: FONTS.SemiBold,
        marginLeft: wp(4),
        marginTop: hp(0.5),
        fontSize: wp(3.5),
        alignSelf: 'flex-start',

        // marginTop:10
    },
    textcov: {
        // marginTop:hp(7),
        alignSelf: 'center',
        // position: 'absolute',
        // bottom: 20
        marginTop: hpPx(20)
    },
    textcov2: {
        marginTop: hp(7),
        alignSelf: 'center',
    },
    lasttxt: {
        fontSize: RF(14),
        fontFamily: FONTS.Medium,
    },

    linecontainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: wp(90),
        marginTop: hpPx(20),
        marginBottom: hpPx(10)
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: Constants.customgrey,
    },
    text: {
        marginHorizontal: 8,
        color: '#666',
        fontSize: RF(10),
        fontFamily: FONTS.SemiBold
    },

    ////toggle button
    btnCov: {
        height: 50,
        flexDirection: 'row',
        backgroundColor: Constants.customgrey5,
        borderRadius: 12,
        marginVertical: 15,
        // marginHorizontal: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    slider: {
        position: 'absolute',
        width: '50%',
        height: '100%',
        backgroundColor: Constants.custom_blue,
        borderRadius: 10,
        zIndex: 0,
    },
    cencelBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    cencelBtn2: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    activeText: {
        color: Constants.white,
    },
    inactiveText: {
        color: Constants.customgrey,
    },
    /////
    /////////logout model //////
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // marginTop: 22,
        backgroundColor: '#rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        // margin: 10,
        backgroundColor: 'white',
        borderRadius: 25,
        // padding: 15,
        alignItems: 'center',
        position: 'relative',
    },

    covline: {
        // flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: 'center',
    },
    croscov: {
        // padding:10,
        // borderRadius:8,
        // borderWidth:1,
        // borderColor:Constants.customgrey5,
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 10
    },
    weltxt: {
        color: Constants.custom_blue,
        fontSize: wp(10),
        fontFamily: FONTS.Heavy
    },
    logo1: {
        color: Constants.white,
        fontSize: wp(10),
        fontFamily: FONTS.Heavy,
        lineHeight: 30,
        marginTop: hp(1)
    },
    logo2: {
        color: Constants.white,
        fontSize: wp(5.5),
        fontFamily: FONTS.Regular
    },
    infotxt: {
        color: Constants.white,
        fontSize: wp(4.5),
        fontFamily: FONTS.SemiBold,
        marginTop: hp(16)
    },
    itemscov: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp(13),
        marginBottom: hp(7),
    },
    onbbtn: {
        height: hp(5),
        borderRadius: wp(2),
        backgroundColor: Constants.white,
        boxShadow: '0px 4px 4px 0.1px grey',
        width: wp(45),
        justifyContent: 'center',
        alignItems: 'center',
    },
    onbbtncov: {
        flexDirection: 'row',
        gap: wp(5),
        marginTop: hp(1.5),
    },
    onbbtntxt: {
        color: Constants.black,
        fontSize: wp(4.5),
        fontFamily: FONTS.SemiBold,
    },

    checkboxcontainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 10,
        width: wp(90),
        paddingLeft: wpPx(20)
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#666',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        borderRadius: 5
    },
    checkedBox: {
        backgroundColor: Constants.black,
    },
    checkmark: {
        color: Constants.white,
        fontSize: 16,
    },
    label: {
        fontSize: RF(14),
        fontFamily: FONTS.Medium,
        fontStyle: 'italic'
    },
})

export default styles;