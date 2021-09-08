import React, { useEffect, useState } from 'react'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, child, get, update } from "firebase/database";
import { connect, useDispatch } from 'react-redux'
import { saveUser } from '../../redux/action'
import * as _ from 'lodash'

import styles from './auth.module.scss'

interface IAuthState {
    isSignUp: Boolean,
    nicknames: [],
}

const Auth: React.FC = () => {
    const [authInputs, setAuthInputs] = useState({
        loginInputs:{
            email: '',
            password: ''
        },
        signUpInputs:{
            email: '',
            password: '',
            repeatPassword: '',
            name: ''
        }
    })
    const [nicknames, setNicknames] = useState<IAuthState['nicknames']>([])
    const [isSignUp, setIsSignUp] = useState<IAuthState['isSignUp']>(false)
    const {loginInputs, signUpInputs} = authInputs
    
    const dispatch = useDispatch()

    const db = getDatabase();
    const dbRef = ref(db);

    useEffect(() => {
        get(child(dbRef, 'nicknames/')).then((snapshot) => {
            if (snapshot.exists()) {
                setNicknames(snapshot.val())
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    },[])

    const signUp = () => {
        const auth = getAuth();
        const db = getDatabase();
        const isNickExist = _.includes(nicknames, signUpInputs.name)
        const isPasswordMatch = signUpInputs.password === signUpInputs.repeatPassword
        isPasswordMatch && !isNickExist
            ?
            createUserWithEmailAndPassword(auth, signUpInputs.email, signUpInputs.password)
                .then((userCredential) => {
                    const user = userCredential.user;

                    set(ref(db, 'users/' + user.uid), {
                        email: signUpInputs.email,
                        displayName: signUpInputs.name,
                        id: user.uid,
                        accountType: 'public'
                    });
                    dispatch(saveUser({
                        email: signUpInputs.email,
                        displayName: signUpInputs.name,
                        id: user.uid,
                        accountType: 'public'
                    }))
                    console.log('1')
                    update(ref(db, '/nicknames'), {
                        [signUpInputs.name]: user.uid
                    });
                    console.log('2')
                    setAuthInputs((prev) => ({
                        ...prev,
                        signUpInputs:{
                            email: '',
                            password: '',
                            repeatPassword: '',
                            name: ''
                        }
                    }))
                    console.log('3')
                    // dispatch(saveUser(user.uid, signUpInputs.name))
                    window.localStorage.setItem('userID', user.uid)
                    window.localStorage.setItem('userName', signUpInputs.name)
                })
                .catch((error) => {
                    const errorCode = error.code;
                    console.log(error.message)
                })
            : alert('Password do not match')
    }

    const login = () => {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, loginInputs.email, loginInputs.password)
            .then((userCredential) => {
                const user = userCredential.user;
                const dbRef = ref(getDatabase());
                get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
                    if (snapshot.exists()) {
                        setAuthInputs((prev) => ({
                            ...prev,
                            loginInputs:{
                                email: '',
                                password: ''
                            }
                        }))
                        dispatch(saveUser(snapshot.val()))
                        window.localStorage.setItem('userID', user.uid)
                        window.localStorage.setItem('userName', snapshot.val().displayName)
                    } else {
                        console.log("No data available");
                    }
                }).catch((error) => {
                    console.error(error);
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
    }

    const AuthInputHandler = (e: any, inputName: string, authMethod: keyof(typeof authInputs)) => {
        setAuthInputs((prev) => ({
            ...prev,
            [authMethod]:{
                ...prev[authMethod],
                [inputName]: e.target.value
            }
        }))
    }

    const changeAuthMethod = () => {
        setIsSignUp(() => {
            return !isSignUp
        })
    }

    return (
        <div className={styles.authForm}>
            {isSignUp
                ? <div className={styles.signUpForm}>
                    <input
                        className={styles.authInput}
                        value={signUpInputs.name}
                        onChange={(e) => AuthInputHandler(e, 'name', 'signUpInputs')}
                        placeholder='Name or nickname'
                    />
                    <input
                        className={styles.authInput}
                        value={signUpInputs.email}
                        onChange={(e) => AuthInputHandler(e, 'email', 'signUpInputs')}
                        placeholder='Email'
                    />
                    <input
                        className={styles.authInput}
                        value={signUpInputs.password}
                        onChange={(e) => AuthInputHandler(e, 'password', 'signUpInputs')}
                        placeholder='Password'
                    />
                    <input
                        className={styles.authInput}
                        value={signUpInputs.repeatPassword}
                        onChange={(e) => AuthInputHandler(e, 'repeatPassword', 'signUpInputs')}
                        placeholder='Repeat password'
                    />
                    <button className={styles.authButton} onClick={() => signUp()}>Sign up</button>
                    <div className={styles.authText}>
                        Already have an account?
                    <div
                            className={styles.authSwitchText}
                            onClick={() => changeAuthMethod()}
                        >
                            Login
                    </div>
                    </div>
                </div>
                :
                <div className={styles.loginForm}>
                    <input
                        className={styles.authInput}
                        required
                        value={loginInputs.email}
                        onChange={(e) => AuthInputHandler(e, 'email', 'loginInputs')}
                        placeholder='Email'
                    />
                    <input
                        className={styles.authInput}
                        required
                        value={loginInputs.password}
                        onChange={(e) => AuthInputHandler(e, 'password', 'loginInputs')}
                        placeholder='Password'
                    />
                    <button className={styles.authButton} onClick={() => login()}>Login</button>
                    <div className={styles.authText}>
                        Don't have an account yet?
                    <div
                            className={styles.authSwitchText}
                            onClick={() => changeAuthMethod()}
                        >
                            Sign up
                    </div>
                    </div>
                </div>
            }
        </div>
    )
}

const mapDispatchToProps = {
    saveUser
}
const mapStateToProps = (state: any) => {
    return {
        userId: state.auth.currentUserId
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth)