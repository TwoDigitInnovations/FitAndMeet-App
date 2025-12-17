import { useContext, useState } from "react"
import { Modal, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native"
import { UserContext } from "../../../App"
import Constants, { FONTS } from "../../utils/Constant"
import { reset } from "../../utils/navigationRef"
import { deleteAuthToken } from "../../utils/storage"
import { removeApiToken } from "../../utils/axios"

const Settings = (props) => {
    const [user, setUser] = useContext(UserContext)
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.toppart}>
                {/* <StatusBar barStyle={Platform.OS === 'android' ? 'dark-content' : 'dark-light'} backgroundColor={Constants.saffron} /> */}
                <View
                    style={{
                        flexDirection: 'row',
                        gap: 10,
                        height: '100%',
                        alignItems: 'center',
                    }}>

                    <TouchableOpacity
                        onPress={() => { }
                        }>
                        <Image
                            source={require('../../Assets/images/profile2.png')}
                            style={styles.hi}
                        />
                    </TouchableOpacity>

                    <Text style={styles.backtxt}>{'Settings'}</Text>
                </View>

            </View>
            <TouchableOpacity
                style={[styles.box, styles.shadowProp, { marginBottom: 80 }]}
                onPress={() => {
                    setModalVisible(true);
                }}>
                <View style={styles.btmboxfirpart}>
                    {/* <View style={styles.iconcov}>
                        <DeleteIcon height={20} width={20} color={Constants.white} />
                    </View> */}
                    <Text style={styles.protxt}>{'Log Out'}</Text>
                </View>
                {/* <RightarrowIcon
                    color={Constants.saffron}
                    height={15}
                    width={15}
                    style={styles.aliself}
                /> */}
            </TouchableOpacity>


            <Modal
                animationType="none"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    // Alert.alert('Modal has been closed.');
                    setModalVisible(!modalVisible);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ backgroundColor: 'white', alignItems: 'center' }}>
                            <Text style={styles.textStyle}>
                                {'Are you sure you want to sign out?'}
                            </Text>
                            <View style={styles.cancelAndLogoutButtonWrapStyle}>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => setModalVisible(!modalVisible)}
                                    style={styles.cancelButtonStyle}>
                                    <Text style={styles.modalText}>{'Cancel'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={async () => {
                                        removeApiToken()
                                        deleteAuthToken();
                                        reset('Auth');
                                    }}
                                    style={styles.logOutButtonStyle}>
                                    <Text style={styles.modalText}>{'Sign out'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default Settings

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Constants.white,
        // paddingVertical: 20,
    },
    backtxt: {
        color: Constants.black,
        fontWeight: '600',
        fontSize: 20,
        fontFamily: FONTS.Medium,
    },
    toppart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Constants.saffron,
    },
    hi: {
        marginRight: 10,
        height: 25,
        width: 25,
        borderRadius: 15,
    },
    aliself: {
        alignSelf: 'center',
        // fontWeight:'bold'
        // fontFamily:FONTS.Bold
    },
    badge: {
        position: 'absolute',
        top: -3,
        right: -3,
        backgroundColor: Constants.green,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    box: {
        paddingHorizontal: 15,
        paddingVertical: 16,
        // borderRadius: 20,
        marginTop: 10,
        backgroundColor: Constants.saffron + 20,
        width: '93%',
        borderRadius: 5,
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    btmboxfirpart: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    protxt: {
        color: Constants.saffron,
        fontSize: 16,
        // fontWeight: '700',
        fontFamily: FONTS.Bold,
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // marginTop: 22,
        backgroundColor: '#rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 17,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        position: 'relative',
    },

    textStyle: {
        color: Constants.black,
        // fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: FONTS.Bold,
        fontSize: 16,
    },
    textStyle2: {
        color: Constants.black,
        // fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: FONTS.Medium,
        fontSize: 16,
    },
    textStyle3: {
        color: Constants.black,
        // fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: FONTS.Medium,
        fontSize: 16,
    },
    modalText: {
        color: Constants.white,
        // fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: FONTS.Bold,
        fontSize: 14,
    },
    cancelAndLogoutButtonWrapStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        gap: 3,
    },
    cancelButtonStyle: {
        flex: 0.5,
        backgroundColor: Constants.black,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        marginRight: 10,
    },
    logOutButtonStyle: {
        flex: 0.5,
        backgroundColor: Constants.red,
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },

});