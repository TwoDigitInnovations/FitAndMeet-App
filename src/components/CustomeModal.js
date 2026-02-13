
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    Modal,
    StyleSheet,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Constants from '../utils/Constant';

const CustomeModal = (props) => {
    const [visible, setVisible] = useState(props.open);

    useEffect(() => {
        console.log(props.open)
    }, [props.open])

    return (
        <Modal
            visible={props.open}
            transparent={true}
            animationType="slide"
            onRequestClose={() => {
                setVisible(false);
                props?.onCancel();
            }}>

            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => {
                    setVisible(false);
                    props?.onCancel();
                }}>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.modalContent, { backgroundColor: props.backgroundColor || '#FFFFFF' }]}>
                    <View style={{ paddingHorizontal: 20, paddingVertical: 30 }}>
                        <View style={{ marginLeft: 10 }}>
                            <Text
                                style={{
                                    color: props?.titleColor || Constants.black,
                                    fontSize: 20,
                                    fontWeight: '700',
                                    marginBottom: 20,
                                }}>
                                {props?.title}
                            </Text>
                        </View>


                        {props.children}


                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                    paddingVertical: 12,
                                    flex: 1
                                }}
                                onPress={() => {
                                    setVisible(false);
                                    props?.onConfirm();
                                }}>
                                <View style={{ marginLeft: 10 }}>
                                    <Text
                                        style={{
                                            color: props?.confirmButtonColor || Constants.black,
                                            fontSize: 18,
                                            fontWeight: '500',
                                            textAlign: 'left',
                                            marginRight: 20,
                                        }}>
                                        {props?.confirmButtonName || 'CONFIRM'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                    paddingVertical: 12,
                                    flex: 1
                                }}
                                onPress={() => {
                                    setVisible(false);
                                    props?.onCancel();
                                }}>
                                <View style={{ marginLeft: 10 }}>
                                    <Text
                                        style={{
                                            color: props?.cancelButtonColor || Constants.black,
                                            fontSize: 18,
                                            fontWeight: '500',
                                            textAlign: 'right',
                                        }}>
                                        {props?.cancelButtonName || 'CANCEL'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default CustomeModal;
