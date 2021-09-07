import React, { useEffect, useState } from 'react'
import { RootStateOrAny, useSelector } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom';
import { getDatabase, ref, child, set, get, remove, update } from "firebase/database";
import {ReactComponent as MenuIcon} from '../../images/menuIcon.svg';
import * as _ from 'lodash'
import { Link } from "react-router-dom";
import styles from './userPage.module.scss'
import Article from '../../components/article/article';

interface IUserPageState extends RouteComponentProps<any> {
    articlePopupIsOpen: Boolean,
    inputsState:{
        articleTitle: string,
        articleText: string,
    },
    popupFor: string,
    userInfo: {
        displayName: string,
        id: string,
        followers: object,
        followed: object,
        articles: object,
        blockedUsers: object
    },
    currentUserAlreadyFollowed: Boolean,
    userMenuIsOpen: Boolean
}

const UserPage: React.FC = (props: any) => {
    const user = useSelector((state: RootStateOrAny) => {
        return state.auth.currentUser
    })  
    const [userMenuIsOpen, setUserMenuIsOpen] = useState<IUserPageState['userMenuIsOpen']>(false)
    const [inputsState, setInputsState] = useState<IUserPageState['inputsState']>({
        articleTitle: '',
        articleText: '',
    })
    const [articlePopupIsOpen, setArticlePopupIsOpen] = useState<IUserPageState['articlePopupIsOpen']>(false)
    const [popupFor, setPopupFor] = useState<IUserPageState['popupFor']>('')
    const [userInfo, setUserInfo] = useState<IUserPageState['userInfo']>({
        displayName: '',
        id: '',
        followers: {},
        followed: {},
        articles: [],
        blockedUsers: []
    })
    const [currentUserAlreadyFollowed, setCurrentUserAlreadyFollowed] = useState<IUserPageState['currentUserAlreadyFollowed']>(false)
    const idFromUrl = props.match.params.id
    const db = getDatabase();
    const dbRef = ref(db);
    const isMe = user.displayName === userInfo.displayName

    useEffect(() => {
        get(child(dbRef, `users/${user.displayName}/followed`)).then((snapshot) => {
            if (snapshot.exists()) {
                setCurrentUserAlreadyFollowed(_.values(snapshot.val()).includes(userInfo.displayName))
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
        
    }, [])

    useEffect(() => {
        get(child(dbRef, `users/${idFromUrl}`)).then((snapshot) => {
            if (snapshot.exists()) {
                setUserInfo(snapshot.val())
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    
        // if(_.includes(userInfo.articles, userNameLocal)){

        // }
    })

    const followHandler = (isFollow: Boolean) => {
        if(isFollow){
            update(ref(db, `users/${userInfo.id}/followers`), {
                [user.id]: user.displayName
            });
            update(ref(db, `users/${user.id}/followed`), {
                [userInfo.id]: userInfo.displayName
            });
            setCurrentUserAlreadyFollowed(true)
        }else{
            remove(ref(db, `users/${userInfo.id}/followers/${user.id}`));
            remove(ref(db, `users/${user.id}/followed/${userInfo.id}`));
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
        set(ref(db, `users/${user.id}/articles/${inputsState.articleTitle}`), {
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
            data = userInfo.followers ? userInfo.followers : []
        }
        if (popupFor === 'followed') {
            data = userInfo.followed ? userInfo.followed : []
        }
        return <div className={styles.popup}>
            <div className={styles.popupHeader}>
                <div className={styles.popupClose} onClick={() => setPopupFor('')}>X</div>
            </div>
            {_.map(data, (item: string, key) => {
                return <div className={styles.followPopupUser}>
                    <div className={styles.followPopupUserPhoto}></div>
                    <Link className={styles.followPopupUserName} to={`/account/${key}`}>{item}</Link>
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
                userName={userInfo.displayName}
                articleTitle={article.name}
                articleText={article.text}
                articleComments={0}
                articleLikes={0}
                articleViews={0}
            />
        })
    }

    const goToChat = () => {
        window.localStorage.setItem('chatWith', idFromUrl)
        update(ref(db, `users/${user.id}/chats/`), {
            [userInfo.id]: idFromUrl
        });
    }

    const blockUser = () => {
        update(ref(db, `users/${user.id}/blockedUsers/`), {
            [idFromUrl]: true
        });
    }

    const sendmessageButton = () => {
        window.localStorage.setItem('chatWith', userInfo.id)
        window.localStorage.setItem('chatWithName', userInfo.displayName)
        update(ref(db, `users/${user.id}/chats/${userInfo.id + '_' + userInfo.displayName}`), {
            temporaryChat: true
        });
    }

    return (
        <div>
            <div className={styles.userMain}>
                {articlePopupIsOpen && renderNewArticlePopup()}
                <div className={styles.userBlock}>
                    <div className={styles.userBlockLeft}>
                        <div className={styles.userPhoto}></div>
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>@{userInfo.displayName}</div>
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
                            <div className={styles.userButtonsWrapper}>
                                {renderFollowButton()}
                                {!isMe && <Link to={`/account/${user.id}/messages`} onClick={() => {
                                    sendmessageButton()
                                }} className={styles.userInfoButton}>Send a message</Link>}
                            </div>
                        </div>
                    </div>
                    <div className={styles.userMenuBlock}>
                        {! isMe && <div className={styles.userMenuWrapper} onClick={() => {
                            setUserMenuIsOpen(!userMenuIsOpen)
                        }}>
                            <MenuIcon className={styles.menuIcon}/>
                        </div>}
                        {userMenuIsOpen && <div className={styles.articleMenu}>
                            <div className={styles.articleMenuItem} onClick={() => blockUser()}>Block this user</div> 
                        </div>}
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