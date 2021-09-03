import React, { useState, useEffect } from 'react'
import { RootStateOrAny, useSelector, useDispatch } from 'react-redux'
import { getDatabase, ref, child, set, get, remove, update } from "firebase/database";
import { getAuth, signOut } from "firebase/auth";
import {Link} from "react-router-dom";
import {logOut} from '../../redux/action'
import * as _ from 'lodash'

import styles from './header.module.scss'

const Header = () => {
    const db = getDatabase();
    const dbRef = ref(db);
    const [nicknames, setNicknames] = useState([]);
    const [headerInput, setHeaderInput] = useState('')

    useEffect(() => {
        get(child(dbRef, 'nicknames/')).then((snapshot) => {
            if (snapshot.exists()) {
                console.log('asdasd', snapshot.val())
                setNicknames(snapshot.val())
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    }, [])

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

    const renderSearchresult = () => {
        const result = _.filter(nicknames, nick => {
            return _.startsWith(nick, headerInput)
        }) 
        return <div className={styles.headerSearchResult}>
            {_.map(result, nick => {
                return <Link to={`/account/${nick}`} onClick={() => setHeaderInput('')}>{nick}</Link>
            })}
        </div>
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
    const onHeaderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHeaderInput(e.currentTarget.value)
    }

    return (
        <header>
            <div className={styles.logo}>BIOME</div>
            <div className={styles.right}>
                <input value={headerInput} onChange={(e) => onHeaderInputChange(e)} placeholder='Type a nickname' className={styles.headerSearch}/>
                {headerInput && renderSearchresult()}
                {user
                    ?
                    <div className={styles.headerUser}>
                        <div className={styles.headerUserName} onClick={() => userMenuHandler()}>{userName}</div>
                        {userMenuShow && <div className={styles.headerUserMenu}>
                            <Link to={'/account/' + userName} onClick={() => setUserMenuShow(false)}>Profile</Link>
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