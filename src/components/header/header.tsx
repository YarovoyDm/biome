import React, { useState, useEffect } from 'react'
import { RootStateOrAny, useSelector, useDispatch } from 'react-redux'
import { getDatabase, ref, child, get } from "firebase/database";
import { getAuth, signOut } from "firebase/auth";
import {Link} from "react-router-dom";
import * as _ from 'lodash'
import {logOut} from '../../redux/action'

import {ReactComponent as Mail} from '../../images/mail.svg';

import styles from './header.module.scss'

interface IHeader {
    nicknames: {
        nick: string
    },
    headerInput: string,
    userMenuShow: Boolean
}

const Header:React.FC = () => {
    const [nicknames, setNicknames] = useState<IHeader['nicknames']>({
        nick: ''
    });
    const [headerInput, setHeaderInput] = useState<IHeader['headerInput']>('')
    const [userMenuShow, setUserMenuShow] = useState<IHeader['userMenuShow']>(false)

    const dispatch = useDispatch()
    const db = getDatabase();
    const dbRef = ref(db);
    const user = useSelector((state: RootStateOrAny) => {
        return state.auth.currentUser
    })

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
    }, [])

    const userMenuHandler = () => {
        setUserMenuShow(() => {
            return !userMenuShow
        })
    }

    const renderSearchresult = () => {
        const result = _.filter(_.keys(nicknames), nick => {
            return _.startsWith(nick, headerInput)
        }) 
        return <div className={styles.headerSearchResult}>
            {_.map(result, nick => {
                return <Link 
                    key={nick}
                    className={styles.headerSearchItem} 
                    to={`/account/${_.get(nicknames, nick)}`} 
                    onClick={() => setHeaderInput('')}
                >{nick}</Link>
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
                <input 
                    value={headerInput} 
                    onChange={(e) => onHeaderInputChange(e)} 
                    placeholder='Type a nickname' 
                    className={styles.headerSearch}
                />
                <Link to={`/account/${user.id}/messages`}>
                    <Mail className={styles.headerMail}/>
                </Link>
                {headerInput && renderSearchresult()}
                {user.id
                    ?
                    <div className={styles.headerUser}>
                        <div className={styles.headerUserName} onClick={() => userMenuHandler()}>
                            {user.displayName}
                        </div>
                        {userMenuShow && <div className={styles.headerUserMenu}>
                            <Link to={`/account/${user.id}`} onClick={() => setUserMenuShow(false)}>Profile</Link>
                            <Link to={`/account/${user.id}/settings`} onClick={() => setUserMenuShow(false)}>Settings</Link>
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