import React, { useEffect } from 'react'
import { getDatabase, ref, child, get } from "firebase/database";
import Auth from '../../components/auth/auth';

import styles from './loginPage.module.scss'

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