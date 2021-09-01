import React, { useEffect, useState } from 'react'
import { RootStateOrAny, useSelector } from 'react-redux'
import { getDatabase, ref, child, set, get, remove, update } from "firebase/database";
import * as _ from 'lodash'
import { Link } from "react-router-dom";
import styles from './userPage.module.scss'
import Article from '../../components/article/article';

const UserPage: React.FC = (props: any) => {
    const userNameLocal = window.localStorage.getItem('userName')
    const userIdLocal: any = window.localStorage.getItem('userID')
    const [articlePopupIsOpen, setArticlePopupIsOpen] = useState(false)
    const [articleTitle, setArticleTitle] = useState('')
    const [articleText, setArticleText] = useState('')
    const [popupFor, setPopupFor] = useState('')
    const [userInfo, setUserInfo] = useState({
        displayName: ''
    })
    const [itsNotMe, setItsNotMe] = useState(false)
    const [currentUserAlreadyFollowed, setCurrentUserAlreadyFollowed] = useState(false)
    const [currentTarget, setCurrentTarget] = useState({
        id: '',
        followers: {},
        followed: {}
    })
    const [userArticles, setUserArticle] = useState<any>([])
    const nickFromUrl = props.match.params.nick

    useEffect(() => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/${nickFromUrl}`)).then((snapshot) => {
            if (snapshot.exists()) {
                setUserInfo(snapshot.val())
                setCurrentTarget(snapshot.val())
                setItsNotMe(userNameLocal !== nickFromUrl)
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });

        get(child(dbRef, `users/${userNameLocal}/followed`)).then((snapshot) => {
            if (snapshot.exists()) {
                setCurrentUserAlreadyFollowed(Object.values(snapshot.val()).includes(nickFromUrl))
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });

        get(child(dbRef, `users/${nickFromUrl}/articles`)).then((snapshot) => {
            if (snapshot.exists()) {
                console.log(snapshot.val())
                setUserArticle(snapshot.val())
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
        setCurrentUserAlreadyFollowed(true)
    }

    const unfollowUser = () => {
        const db = getDatabase();
        remove(ref(db, `users/${nickFromUrl}/followers/${userIdLocal}`));
        remove(ref(db, `users/${userNameLocal}/followed/${currentTarget.id}`));
        setCurrentUserAlreadyFollowed(false)
    }

    const renderFollowButton = () => {
        if (itsNotMe) {
            if (currentUserAlreadyFollowed) {
                return <div className={styles.userInfoButton} onClick={() => unfollowUser()}>Unfollow</div>
            }
            if (!currentUserAlreadyFollowed) {
                return <div onClick={() => followUser()} className={styles.userInfoButton}>Follow</div>
            }
        }else{
            return <div onClick={() => setArticlePopupIsOpen(true)} className={styles.userInfoButton}>Create an article</div>
        }
    }

    const onArticleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArticleTitle(e.currentTarget.value)
    }
    const onArticleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setArticleText(e.currentTarget.value)
    }

    const saveArticle = () => {
        const db = getDatabase();
        set(ref(db, `users/${userNameLocal}/articles/${articleTitle}`), {
            text: articleText,
            date: Date.now(),
            name: articleTitle
        });
        setArticleTitle(() => {
            return ''
        })
        setArticleText(() => {
            return ''
        })
        setArticlePopupIsOpen(() => {
            return !articlePopupIsOpen
        })
    }

    const renderNewArticlePopup = () => {
        return <div className={styles.newArticlePopup}>
            <input
                className={styles.articleTitle} 
                type='text' 
                placeholder='Title...'
                value={articleTitle}
                onChange={onArticleTitleChange}
            />
            <textarea 
                placeholder='Type something special...' 
                className={styles.articleText} 
                value={articleText}
                onChange={onArticleTextChange}
            />
            <div className={styles.articleButtons}>
                <div className={styles.articleButton} onClick={() => setArticlePopupIsOpen(false)}>Cancel</div>
                <div className={styles.articleButton} onClick={() => saveArticle()}>Create</div>
            </div>
        </div>
    }

    const renderFollowInfoPopup = () => {
        let data = null
        if (popupFor === 'followers') {
            data = currentTarget.followers ? Object.values(currentTarget.followers) : []
        }
        if (popupFor === 'followed') {
            data = currentTarget.followed ? Object.values(currentTarget.followed) : []
        }
        return <div className={styles.popup}>
            <div className={styles.popupHeader}>
                <div className={styles.popupClose} onClick={() => setPopupFor('')}>X</div>
            </div>
            {_.map(data, (item: string) => {
                return <div className={styles.followPopupUser}>
                    <div className={styles.followPopupUserPhoto}></div>
                    <Link className={styles.followPopupUserName} to={`/account/${item}`}>{item}</Link>
                </div>
            })}
        </div>
    }

    const renderArticles = () => {
        if(_.isEmpty(userArticles)){
            return <div>There is no articles yet...</div>
        }
        return _.map(userArticles, article => {
            return <Article 
                userName={nickFromUrl}
                articleTitle={article.name}
                articleText={article.text}
                articleComments={0}
                articleLikes={0}
                articleViews={0}
            />
        })
    }

    return (
        <div>
            <div className={styles.userMain}>
                {articlePopupIsOpen && renderNewArticlePopup()}
                <div className={styles.userBlock}>
                    <div className={styles.userPhoto}></div>
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>@{userInfo.displayName}</div>
                        <div className={styles.userInfoActivity}>
                            {popupFor && renderFollowInfoPopup()}
                            <div className={styles.userPosts}>0 Posts</div>
                            <div
                                onClick={() => setPopupFor('followers')}
                                className={styles.userFollowers}
                            >
                                {currentTarget.followers ? Object.values(currentTarget.followers).length : 0} Followers
                            </div>
                            <div className={styles.userFollowed}
                                onClick={() => setPopupFor('followed')}
                            >
                                {currentTarget.followed ? Object.values(currentTarget.followed).length : 0} Followed
                            </div>
                        </div>
                        {renderFollowButton()}
                    </div>
                </div>
                <div className={styles.userArticlesBlock}>
                    {renderArticles()}
                </div>
            </div>
        </div>
    )
}

export default UserPage