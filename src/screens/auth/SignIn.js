import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Linking,
    ScrollView,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import styles from './styles';
import { navigate, reset } from '../../utils/navigationRef';
import Constants from '../../utils/Constant';
import * as Yup from 'yup';
import { Formik, useFormik } from 'formik';
import axios, { setApiToken } from '../../utils/axios'
import { LoadContext, UserContext } from '../../../App';
import Toast from 'react-native-toast-message'
import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { setAuthToken } from '../../utils/storage';

const SignIn = () => {
    const [showPass, setShowPass] = useState(true);
    const [loading, setLoading] = useContext(LoadContext);
    const [user, setUser] = useContext(UserContext);

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: (values, assets) => {
            submit(values, assets)
        },
    });

    const submit = async (value, { resetForm }) => {
        console.log('enter')
        // const player_id = await OneSignal.User.pushSubscription.getIdAsync()
        //   const device_token = await OneSignal.User.pushSubscription.getTokenAsync()

        //     value.player_id= player_id
        //     value.device_token =device_token,
        setLoading(true)
        try {
            setLoading(false);
            const res = await axios.post('auth/login', value);

            if (res.status) {
                setApiToken(res.data.token);
                await setAuthToken(res.data.token)
                setUser(res.data.user)
                resetForm()
                reset('App')
            }
            console.log(res)
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: err
            });
            setLoading(false);
            console.log(err)
        }


    };
    return (
        <View style={styles.container}>

            {/* <View > */}
            <View style={styles.buttompart} >
                <Image source={require('../../Assets/images/logo.png')} style={styles.proimg} />
                <Text style={styles.headtxt} >Login</Text>
                <View>
                    <Text style={styles.titletext}>Email</Text>
                    <View style={styles.inpcov}>
                        <TextInput
                            style={styles.inputfield}
                            placeholder="Enter your email"
                            textAlign='left'
                            placeholderTextColor={Constants.customgrey2}
                            value={formik.values.email}
                            onChangeText={formik.handleChange('email')}
                            onBlur={formik.handleBlur('email')}
                        />
                    </View>
                </View>

                {formik.touched.email && formik.errors.email &&
                    <Text style={styles.require}>{formik.errors.email}</Text>
                }
                <View>
                    <Text style={styles.titletext}>Password</Text>
                    <View style={styles.inpcov}>
                        <TextInput
                            style={styles.inputfield}
                            placeholder="Enter Password"
                            secureTextEntry={showPass}
                            placeholderTextColor={Constants.customgrey2}
                            value={formik.values.password}
                            onChangeText={formik.handleChange('password')}
                            onBlur={formik.handleBlur('password')}
                        />

                        <TouchableOpacity
                            onPress={() => {
                                setShowPass(!showPass);
                            }}
                            style={[styles.iconView, { borderRightWidth: 0 }]}>
                            {/* <Image
                            source={
                                showPass
                                    ? require('../../Assets/Images/eye-1.png')
                                    : require('../../Assets/Images/eye.png')
                            }
                            style={{ height: 28, width: 28 }}
                            resizeMode="contain"
                        /> */}
                        </TouchableOpacity>
                    </View>
                </View>
                {formik.touched.password && formik.errors.password &&
                    <Text style={styles.require}>{formik.errors.password}</Text>
                }
                <Text style={styles.forgtxt} onPress={() => navigate('ForgotPassword')}>
                    Forgot Password ?
                </Text>
                <TouchableOpacity style={styles.btncov} onPress={formik.handleSubmit}>
                    <Text style={styles.btntxt}>Sign In</Text>
                </TouchableOpacity>
                <View style={styles.linecontainer}>
                    <View style={styles.line} />
                    <Text style={styles.text}>OR</Text>
                    <View style={styles.line} />
                </View>
                <TouchableOpacity style={styles.socialbtncov} onPress={formik.handleSubmit}>
                    <Image source={require('../../Assets/images/g-logo.png')} style={{ height: 35, width: 35 }} />
                    <Text style={styles.socialbtntxt}>Sign In with Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialbtncov} onPress={formik.handleSubmit}>
                    <Image source={require('../../Assets/images/apple.png')} style={{ height: 35, width: 35, }} resizeMode='contain' />
                    <Text style={styles.socialbtntxt}>Sign In with Apple</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.textcov} onPress={() => navigate('SignUp')}>
                <Text style={[styles.lasttxt, { color: Constants.customgrey }]}>Don’t have an account ? </Text>
                <Text style={[styles.lasttxt, { color: Constants.customblack, textDecorationLine: 'underline' }]}>Sign Up</Text>
            </Text>
            {/* </View> */}
        </View>
    );
};

export default SignIn;