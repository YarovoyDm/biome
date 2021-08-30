import React, { useState, useEffect } from 'react'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, child, get } from "firebase/database";
import { connect } from 'react-redux'
import { saveUser } from '../../redux/action'
import { useDispatch } from 'react-redux'

import styles from './auth.module.scss'

const Auth: React.FC = () => {

    const [emailLogin, setEmailLogin] = useState('')
    const [passwordLogin, setPasswordLogin] = useState('')
    const [emailSignUp, setEmailSignUp] = useState('')
    const [passwordSignUp, setPasswordSignUp] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [name, setName] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const dispatch = useDispatch()

    const signUp = () => {
        const auth = getAuth();
        const db = getDatabase();
        passwordSignUp === repeatPassword
            ?
            createUserWithEmailAndPassword(auth, emailSignUp, passwordSignUp)
                .then((userCredential) => {
                    const user = userCredential.user;

                    set(ref(db, 'users/' + name), {
                        email: emailSignUp,
                        displayName: name,
                        id: user.uid
                    });

                    setRepeatPassword('')
                    setName('')
                    setPasswordSignUp('')
                    setEmailSignUp('')

                    dispatch(saveUser(user.uid, name))
                    window.localStorage.setItem('userID', user.uid)
                    window.localStorage.setItem('userName', name)
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                })
            : alert('Password do not match')
    }

    const login = () => {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, emailLogin, passwordLogin)
            .then((userCredential) => {
                const user = userCredential.user;
                const dbRef = ref(getDatabase());
                get(child(dbRef, `users/${name}`)).then((snapshot) => {
                    if (snapshot.exists()) {
                        setEmailLogin('')
                        setPasswordLogin('')
                        dispatch(saveUser(user.uid, snapshot.val().displayName))
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

    const emailSignUpHandler = (e: React.FormEvent<HTMLInputElement>) => {
        setEmailSignUp(e.currentTarget.value)
    }
    const passwordSignUpHandler = (e: React.FormEvent<HTMLInputElement>) => {
        setPasswordSignUp(e.currentTarget.value)
    }
    const emailLoginHandler = (e: React.FormEvent<HTMLInputElement>) => {
        setEmailLogin(e.currentTarget.value)
    }
    const passwordLoginHandler = (e: React.FormEvent<HTMLInputElement>) => {
        setPasswordLogin(e.currentTarget.value)
    }
    const nameHandler = (e: React.FormEvent<HTMLInputElement>) => {
        setName(e.currentTarget.value)
    }
    const repeatPasswordHandler = (e: React.FormEvent<HTMLInputElement>) => {
        setRepeatPassword(e.currentTarget.value)
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
                        value={name}
                        onChange={(e) => nameHandler(e)}
                        placeholder='Name or nickname'
                    />
                    <input
                        className={styles.authInput}
                        value={emailSignUp}
                        onChange={(e) => emailSignUpHandler(e)}
                        placeholder='Email'
                    />
                    <input
                        className={styles.authInput}
                        value={passwordSignUp}
                        onChange={(e) => passwordSignUpHandler(e)}
                        placeholder='Password'
                    />
                    <input
                        className={styles.authInput}
                        value={repeatPassword}
                        onChange={(e) => repeatPasswordHandler(e)}
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
                        value={emailLogin}
                        onChange={(e) => emailLoginHandler(e)}
                        placeholder='Email'
                    />
                    <input
                        className={styles.authInput}
                        required
                        value={passwordLogin}
                        onChange={(e) => passwordLoginHandler(e)}
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