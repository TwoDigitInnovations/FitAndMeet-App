import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
} from 'react-native';
import React, { useContext, useState } from 'react';
import styles from './styles';
import { navigate, reset } from '../../utils/navigationRef';
import Constants from '../../utils/Constant';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Toast from 'react-native-toast-message';
import { LoadContext } from '../../../App';
import axios from '../../utils/axios'


const ForgotPassword = () => {
    const [showPass, setShowPass] = useState(true);
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useContext(LoadContext);
    const [token, setToken] = useState('')



    const validationEmailSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Email is required'),
    });
    const validationOtpSchema = Yup.object().shape({
        otp: Yup.number().required('Otp is required'),
    });
    const validationPasswordSchema = Yup.object().shape({
        password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
        conformpassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords must match')
            .required('Confirm Password is required'),
    });

    const formikEmail = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: validationEmailSchema,
        onSubmit: (values, assets) => {
            // setStep(1)
            sendOtp(values, assets)
        },
    });

    const formikOtp = useFormik({
        initialValues: {
            otp: '',
        },
        validationSchema: validationOtpSchema,
        onSubmit: (values, assets) => {
            // setStep(2)
            verifyOtp(values, assets)
        },
    });

    const formikPassword = useFormik({
        initialValues: {
            conformpassword: '',
            password: '',
        },
        validationSchema: validationPasswordSchema,
        onSubmit: (values, assets) => {
            // setStep(0)
            changePassword(values, assets)
        },
    });



    const sendOtp = async (value, { resetForm }) => {
        setLoading(true);
        try {
            const res = await axios.post('auth/sendOTP', value);
            console.log(res)
            if (res.status) {
                resetForm()
                setToken(res.data.token)
                setLoading(false);
                setStep(1)
                Toast.show({
                    type: 'success',
                    text1: res.data.message
                });
            }
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: err
            });
            setLoading(false);
            console.log(err)
        }

    };
    const verifyOtp = async (value, { resetForm }) => {
        console.log(value)
        setLoading(true);
        const data = {
            otp: value.otp,
            token
        }
        console.log(data)
        try {
            const res = await axios.post('auth/verifyOTP', data);
            console.log(res)
            if (res.status) {
                resetForm()
                setToken(res.data.token)
                setLoading(false);
                setStep(2)
                Toast.show({
                    type: 'success',
                    text1: res.data.message
                });
            }
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: err
            });
            setLoading(false);
            console.log(err)
        }

    };
    const changePassword = async (value, { resetForm }) => {
        setLoading(true);
        try {
            const res = await axios.post('auth/changePassword', { ...value, token });
            console.log(res)
            if (res.status) {
                resetForm()
                setLoading(false);
                setStep(0)
                setToken('')
                Toast.show({
                    type: 'success',
                    text1: res.data.message
                });
                navigate('SignIn');

            }
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

            <View style={styles.buttompart} >
                <Image source={require('../../Assets/images/logo.png')} style={styles.proimg} />
                <Text style={styles.headtxt} >Forgot Password</Text>
                <Text style={styles.headtxt1} >Enter your registered email address and we’ll send you a link to reset your password.</Text>
                {step === 0 && <View>
                    <View>
                        <Text style={styles.titletext}>Enter registered email</Text>
                        <View style={styles.inpcov}>
                            <TextInput
                                style={styles.inputfield}
                                placeholder="Enter your email"
                                textAlign='left'
                                placeholderTextColor={Constants.customgrey2}
                                value={formikEmail.values.email}
                                onChangeText={formikEmail.handleChange('email')}
                                onBlur={formikEmail.handleBlur('email')}
                            />
                        </View>
                    </View>

                    {formikEmail.touched.email && formikEmail.errors.email &&
                        <Text style={styles.require}>{formikEmail.errors.email}</Text>
                    }
                    <TouchableOpacity style={styles.btncov} onPress={formikEmail.handleSubmit}>
                        <Text style={styles.btntxt}>Send OTP</Text>
                    </TouchableOpacity>
                </View>}

                {step === 1 && <View>
                    <View>
                        <Text style={styles.titletext}>Enter OTP</Text>
                        <View style={styles.inpcov}>
                            <TextInput
                                style={styles.inputfield}
                                placeholder="Enter OTP"
                                textAlign='left'
                                placeholderTextColor={Constants.customgrey2}
                                value={formikOtp.values.otp}
                                onChangeText={formikOtp.handleChange('otp')}
                                onBlur={formikOtp.handleBlur('otp')}
                            />
                        </View>
                    </View>

                    {formikOtp.touched.otp && formikOtp.errors.otp &&
                        <Text style={styles.require}>{formikOtp.errors.otp}</Text>
                    }
                    <TouchableOpacity style={styles.btncov} onPress={formikOtp.handleSubmit}>
                        <Text style={styles.btntxt}>Verify OTP</Text>
                    </TouchableOpacity>
                </View>}

                {step === 2 && <View>
                    <Text style={styles.titletext}>Password</Text>
                    <View style={styles.inpcov}>
                        <TextInput
                            style={styles.inputfield}
                            placeholder="Enter Password"
                            secureTextEntry={showPass}
                            placeholderTextColor={Constants.customgrey2}
                            value={formikPassword.values.password}
                            onChangeText={formikPassword.handleChange('password')}
                            onBlur={formikPassword.handleBlur('password')}
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
                    {formikPassword.touched.password && formikPassword.errors.password &&
                        <Text style={styles.require}>{formikPassword.errors.password}</Text>
                    }
                    <Text style={styles.titletext}>Confirm Password</Text>
                    <View style={styles.inpcov}>
                        <TextInput
                            style={styles.inputfield}
                            placeholder="Enter Confirm Password"
                            secureTextEntry={showPass}
                            placeholderTextColor={Constants.customgrey2}
                            value={formikPassword.values.conformpassword}
                            onChangeText={formikPassword.handleChange('conformpassword')}
                            onBlur={formikPassword.handleBlur('conformpassword')}
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
                    {formikPassword.touched.conformpassword && formikPassword.errors.conformpassword &&
                        <Text style={styles.require}>{formikPassword.errors.conformpassword}</Text>
                    }
                    <TouchableOpacity style={styles.btncov} onPress={formikPassword.handleSubmit}>
                        <Text style={styles.btntxt}>Set Password</Text>
                    </TouchableOpacity>
                </View>}

            </View>
            <Text style={styles.textcov} onPress={() => navigate('SignIn')}>
                <Text style={[styles.lasttxt, { color: Constants.customgrey }]}>Have an account ? </Text>
                <Text style={[styles.lasttxt, { color: Constants.customblack, textDecorationLine: 'underline' }]}>Sign In</Text>
            </Text>
        </View>
    );
};

export default ForgotPassword;