import React, { useEffect, useState } from 'react'
import { RootStateOrAny, useSelector } from 'react-redux'
import {logOut} from '../../redux/action'
import { getAuth, signOut } from "firebase/auth";
import {Link} from "react-router-dom";
import styles from './header.module.scss'
import {useDispatch,} from 'react-redux'

const Header = () => {
    const user = useSelector((state: RootStateOrAny) => {
        return state.auth.currentUser.userId
    })

    const userName = useSelector((state: RootStateOrAny) => {
        return state.auth.currentUser.userName
    })

    const [userMenuShow, setUserMenuShow] = useState(false)
    const dispatch = useDispatch()

    const userMenuHandler = () => {
        setUserMenuShow(() => {
            return !userMenuShow
        })
    }

    const exit = () => {
        const auth = getAuth();
        signOut(auth).then((res) => {
            dispatch(logOut())
            window.localStorage.clear()
        }).catch((error) => {
            // An error happened.
        });
    }

    return (
        <header>
            <div className={styles.logo}>BIOME</div>
            <div className={styles.right}>
                {user
                    ?
                    <div className={styles.headerUser}>
                        <div className={styles.headerUserName} onClick={() => userMenuHandler()}>{userName}</div>
                        {userMenuShow && <div className={styles.headerUserMenu}>
                            <Link to={'/account/' + userName}>Profile</Link>
                            <div>Settings</div>
                            <div onClick={() => exit()}>Log out</div>
                        </div>}
                    </div>
                    :
                    <div className={styles.authButtons}>
                        <Link to={'/auth'} className={styles.authButton}>Log in</Link>
                    </div>
                }
            </div>
        </header>
    )
}

export default Header