import React, {useEffect, useState} from 'react'
import { RootStateOrAny, useSelector } from 'react-redux'
import { getDatabase, ref, set, child, get } from "firebase/database";
import {withRouter} from 'react-router'
import styles from './userPage.module.scss'

const UserPage = (props:any) => {
    const userNameLocal = window.localStorage.getItem('userName')

    const [userInfo, setUserInfo] = useState({
        displayName: ''
    })

    useEffect(() => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/${props.match.params.nick}`)).then((snapshot) => {
            if (snapshot.exists()) {
                setUserInfo(snapshot.val())
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    }, [])

    return (
        <div>
            testiruem
            {userInfo.displayName}
            {userNameLocal === userInfo.displayName && <div>Ebat</div>}
        </div>
    )
}

export default UserPage