import React, {useEffect, useState} from 'react'
import { RootStateOrAny, useSelector } from 'react-redux'
import { getDatabase, ref, child, get, remove, update } from "firebase/database";
import styles from './userPage.module.scss'

const UserPage = (props:any) => {
    const userNameLocal = window.localStorage.getItem('userName')
    const userIdLocal: any = window.localStorage.getItem('userID')
    const [userInfo, setUserInfo] = useState({
        displayName: ''
    })
    const [currentUserFollowed, setCurrentUserFollowed] = useState(false)
    const [currentTarget, setCurrentTarget] = useState({
        id: '',
        followers: {},
        followed: {}
    })
    const nickFromUrl = props.match.params.nick

    useEffect(() => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/${nickFromUrl}`)).then((snapshot) => {
            if (snapshot.exists()) {
                setUserInfo(snapshot.val())
                setCurrentTarget(snapshot.val())
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
        get(child(dbRef, `users/${userNameLocal}/followed`)).then((snapshot) => {
            if (snapshot.exists()) {
                setCurrentUserFollowed(Object.values(snapshot.val()).includes(nickFromUrl))
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    }, [])

    const followUser = () => {
        const db = getDatabase();
        update(ref(db, `users/${nickFromUrl}/followers`), {
            [userIdLocal]: userNameLocal
        });
        update(ref(db, `users/${userNameLocal}/followed`), {
            [currentTarget.id]: nickFromUrl
        });
        setCurrentUserFollowed(true)
    }

    const unfollowUser = () => {
        const db = getDatabase();
        remove(ref(db, `users/${nickFromUrl}/followers/${userIdLocal}`));
        remove(ref(db, `users/${userNameLocal}/followed/${currentTarget.id}`));
        setCurrentUserFollowed(false)
    }

    const renderFollowButton = () => {
        const itsNotMe = userNameLocal !== userInfo.displayName
        if(itsNotMe){
            if(currentUserFollowed){
                return <div className={styles.FollowButton} onClick={() => unfollowUser()}>Unfollow</div>
            }
            if(!currentUserFollowed){
                return <div onClick={() => followUser()} className={styles.FollowButton}>Follow</div>
            }
        }
    }

    return (
        <div>
            <div className={styles.userMain}>
                <div className={styles.userBlock}>
                    <div className={styles.userPhoto}></div>
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>@{userInfo.displayName}</div>
                        <div className={styles.userInfoActivity}>
                            <div className={styles.userPosts}>0 Posts</div>
                            <div className={styles.userFollowers}>Followers {currentTarget.followers ? Object.values(currentTarget.followers).length : 0}</div>
                            <div className={styles.userFollowed}>Followed {currentTarget.followed ? Object.values(currentTarget.followed).length : 0}</div>
                        </div>
                        {renderFollowButton()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserPage