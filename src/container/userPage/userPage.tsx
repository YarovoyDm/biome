import React, { useEffect, useState } from 'react'
import { RootStateOrAny, useSelector } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom';
import { getDatabase, ref, child, set, get, remove, update } from "firebase/database";
import * as _ from 'lodash'
import { Link } from "react-router-dom";
import styles from './userPage.module.scss'
import Article from '../../components/article/article';

interface IUserPageState extends RouteComponentProps<any> {
    articlePopupIsOpen: string,
    inputsState:{
        articleTitle: string,
        articleText: string,
    },
    popupFor: Boolean,
    userInfo: {
        displayName: string,
        id: string,
        followers: object,
        followed: object,
        articles: object
    },
    itsNotMe: Boolean,
    currentUserAlreadyFollowed: Boolean
}

const UserPage: React.FC<IUserPageState> = (props: any) => {
    const [inputsState, setInputsState] = useState({
        articleTitle: '',
        articleText: '',
    })
    const [articlePopupIsOpen, setArticlePopupIsOpen] = useState(false)
    const [popupFor, setPopupFor] = useState('')
    const [userInfo, setUserInfo] = useState({
        displayName: '',
        id: '',
        followers: {},
        followed: {},
        articles: []
    })
    const [currentUserAlreadyFollowed, setCurrentUserAlreadyFollowed] = useState(false)

    const userNameLocal = window.localStorage.getItem('userName')
    const userIdLocal: any = window.localStorage.getItem('userID')
    const nickFromUrl = props.match.params.nick
    const db = getDatabase();
    const dbRef = ref(db);
    const isMe = userNameLocal === nickFromUrl

    useEffect(() => {
        get(child(dbRef, `users/${userNameLocal}/followed`)).then((snapshot) => {
            if (snapshot.exists()) {
                setCurrentUserAlreadyFollowed(_.values(snapshot.val()).includes(nickFromUrl))
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    }, [])

    useEffect(() => {
        get(child(dbRef, `users/${nickFromUrl}`)).then((snapshot) => {
            if (snapshot.exists()) {
                setUserInfo(snapshot.val())
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    })

    const followHandler = (isFollow: Boolean) => {
        if(isFollow){
            update(ref(db, `users/${nickFromUrl}/followers`), {
                [userIdLocal]: userNameLocal
            });
            update(ref(db, `users/${userNameLocal}/followed`), {
                [userInfo.id]: nickFromUrl
            });
            setCurrentUserAlreadyFollowed(true)
        }else{
            remove(ref(db, `users/${nickFromUrl}/followers/${userIdLocal}`));
            remove(ref(db, `users/${userNameLocal}/followed/${userInfo.id}`));
            setCurrentUserAlreadyFollowed(false)
        }
    }

    const renderFollowButton = () => {
        if (!isMe) {
            if (currentUserAlreadyFollowed) {
                return <div className={styles.userInfoButton} onClick={() => followHandler(false)}>Unfollow</div>
            }
            if (!currentUserAlreadyFollowed) {
                return <div onClick={() => followHandler(true)} className={styles.userInfoButton}>Follow</div>
            }
        }else{
            return <div onClick={() => setArticlePopupIsOpen(true)} className={styles.userInfoButton}>Create an article</div>
        }
    }

    const onArticleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
        setInputsState(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const saveArticle = () => {
        set(ref(db, `users/${userNameLocal}/articles/${inputsState.articleTitle}`), {
            text: inputsState.articleText,
            date: Date.now(),
            name: inputsState.articleTitle
        });
        setInputsState({
            articleTitle: '',
            articleText: '',
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
                value={inputsState.articleTitle}
                name='articleTitle'
                onChange={onArticleInputChange}
            />
            <textarea 
                placeholder='Type something special...' 
                className={styles.articleText} 
                value={inputsState.articleText}
                name='articleText'
                onChange={onArticleInputChange}
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
            data = userInfo.followers ? _.values(userInfo.followers) : []
        }
        if (popupFor === 'followed') {
            data = userInfo.followed ? _.values(userInfo.followed) : []
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
        if(_.isEmpty(userInfo.articles)){
            return <div>There is no articles yet...</div>
        }
        return _.map(userInfo.articles as any, article => {
            return <Article 
                isMe={isMe}
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
                        <div className={styles.userName}>@{nickFromUrl}</div>
                        <div className={styles.userInfoActivity}>
                            {popupFor && renderFollowInfoPopup()}
                            <div className={styles.userPosts}>{userInfo.articles ?  _.size(userInfo.articles) : 0} Posts</div>
                            <div
                                onClick={() => setPopupFor('followers')}
                                className={styles.userFollowers}
                            >
                                {userInfo.followers ? _.size(userInfo.followers) : 0} Followers
                            </div>
                            <div className={styles.userFollowed}
                                onClick={() => setPopupFor('followed')}
                            >
                                {userInfo.followed ? _.size(userInfo.followed) : 0} Followed
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