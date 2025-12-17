import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Linking,
    ScrollView,
    Pressable,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import styles from './styles';
import { navigate, reset } from '../../utils/navigationRef';
import Constants from '../../utils/Constant';
import * as Yup from 'yup';
import { Formik, useFormik } from 'formik';
import axios from '../../utils/axios'
import Toast from 'react-native-toast-message';
import { LoadContext } from '../../../App';


const SignUp = () => {
    const [showPass, setShowPass] = useState(true);
    const [showEmail, setShowEmail] = useState(false)
    const [loading, setLoading] = useContext(LoadContext);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
        isAgree: Yup.boolean().oneOf([true], 'You must accept the terms and conditions')
            .required('Required'),

    });

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            isAgree: false
        },
        validationSchema: validationSchema,
        onSubmit: (values, assets) => {
            submit(values, assets)
        },
    });

    const submit = async (value, { resetForm }) => {
        console.log('value', value)
        try {
            const res = await axios.post('auth/register', value);
            console.log(res)
            if (res.status) {
                resetForm()
                navigate('SignIn');
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

    return (
        <View style={styles.container}>
            <ScrollView>
                {/* <View > */}
                <View style={styles.buttompart} >

                    <Image source={require('../../Assets/images/logo.png')} style={styles.proimg} />
                    <Text style={styles.headtxt} >SignUp</Text>
                    {showEmail && <View style={styles.buttompart}>
                        <View>
                            <Text style={styles.titletext}>Full Name</Text>
                            <View style={styles.inpcov}>
                                <TextInput
                                    style={styles.inputfield}
                                    placeholder="Enter your Full Name"
                                    textAlign='left'
                                    placeholderTextColor={Constants.customgrey2}
                                    value={formik.values.name}
                                    onChangeText={formik.handleChange('name')}
                                    onBlur={formik.handleBlur('name')}
                                />
                            </View>
                        </View>

                        {formik.touched.name && formik.errors.name &&
                            <Text style={styles.require}>{formik.errors.name}</Text>
                        }
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

                        <View
                            style={styles.checkboxcontainer}
                        >
                            <TouchableOpacity onPress={() => { formik.setFieldValue('isAgree', formik.values.isAgree ? false : true) }} style={[styles.checkbox, formik.values.isAgree && styles.checkedBox]}>
                                {formik.values.isAgree && <Text style={styles.checkmark}>✔</Text>}
                            </TouchableOpacity>
                            <Text style={styles.label}>I agree to the <Text>"Terms"</Text> & <Text>"Privacy Policy"</Text></Text>
                        </View>
                        {formik.touched.isAgree && formik.errors.isAgree &&
                            <Text style={styles.require}>{formik.errors.isAgree}</Text>
                        }

                        <TouchableOpacity style={styles.btncov} onPress={formik.handleSubmit}>
                            <Text style={styles.btntxt}>Create Account</Text>
                        </TouchableOpacity>
                        <View style={styles.linecontainer}>
                            <View style={styles.line} />
                            <Text style={styles.text}>OR</Text>
                            <View style={styles.line} />
                        </View>


                    </View>}
                    <TouchableOpacity style={styles.socialbtncov} onPress={() => { }}>
                        <Image source={require('../../Assets/images/g-logo.png')} style={{ height: 35, width: 35 }} />
                        <Text style={styles.socialbtntxt}>Sign Up with Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialbtncov} onPress={() => { }}>
                        <Image source={require('../../Assets/images/apple.png')} style={{ height: 35, width: 35, }} resizeMode='contain' />
                        <Text style={styles.socialbtntxt}>Sign Up with Apple</Text>
                    </TouchableOpacity>
                    {!showEmail && <TouchableOpacity style={styles.socialbtncov} onPress={() => setShowEmail(true)}>
                        <Image source={require('../../Assets/images/mail.png')} style={{ height: 35, width: 35, }} resizeMode='contain' />
                        <Text style={styles.socialbtntxt}>Sign Up with Email</Text>
                    </TouchableOpacity>}
                </View>
                <Text style={styles.textcov} onPress={() => navigate('SignIn')}>
                    <Text style={[styles.lasttxt, { color: Constants.customgrey }]}>Have an account ? </Text>
                    <Text style={[styles.lasttxt, { color: Constants.customblack, textDecorationLine: 'underline' }]}>Sign In</Text>
                </Text>
                {/* </View> */}
            </ScrollView>
        </View>
    );
};

export default SignUp;