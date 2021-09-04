import React, { useState, useEffect } from 'react'
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, child, get } from "firebase/database";


import styles from './loginPage.module.scss'
import Auth from '../../components/auth/auth';

const AuthPage: React.FC = () => {
    useEffect(() => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, '/')).then((snapshot) => {
            if (snapshot.exists()) {
                console.log(snapshot.val());
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    }, [])

    return (
        <div className={styles.authPage}>
            <Auth />
        </div>
    )
}

export default AuthPage