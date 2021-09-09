import React, { useEffect, useState } from 'react'
import { RootStateOrAny, useSelector } from 'react-redux'
import { getDatabase, ref, child, set, get, remove, update, onValue } from "firebase/database";
import * as _ from 'lodash'
import { Link } from "react-router-dom";
import Article from '../../components/article/article';

import { ReactComponent as MenuIcon } from '../../images/menuIcon.svg';
import { ReactComponent as Instagram } from '../../images/instagram.svg';

import styles from './userPage.module.scss'


interface IUserPageState {
    articlePopupIsOpen: Boolean,
    inputsState: {
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
        blockedUsers: object,
        socials: {
            instagram: string
        }
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
    const [userGuestInfo, setUserGuestInfo] = useState<IUserPageState['userInfo']>({
        displayName: '',
        id: '',
        followers: {},
        followed: {},
        articles: [],
        blockedUsers: {},
        socials: {
            instagram: ''
        }
    })
    const [currentUserAlreadyFollowed, setCurrentUserAlreadyFollowed] = useState<IUserPageState['currentUserAlreadyFollowed']>(false)
    const idFromUrl = props.match.params.id
    const db = getDatabase();
    const isMe = user.displayName === userGuestInfo.displayName
    let isGuestBanned = _.includes(_.keys(userGuestInfo.blockedUsers), user.id)
    let isGuestBannedByMe = _.includes(_.keys(user.blockedUsers), idFromUrl)
    const userRef = ref(db, `users/${idFromUrl}`);

    useEffect(() => {
        setCurrentUserAlreadyFollowed(_.values(user.followed).includes(userGuestInfo.displayName))
        onValue(userRef, (snapshot) => {
            setUserGuestInfo(snapshot.val());
        });
    }, [])

    useEffect(() => {
        onValue(userRef, (snapshot) => {
            setUserGuestInfo(snapshot.val());
        });
    }, [articlePopupIsOpen, userMenuIsOpen])

    const followHandler = (isFollow: Boolean) => {
        if (isFollow) {
            update(ref(db, `users/${userGuestInfo.id}/followers`), {
                [user.id]: user.displayName
            });
            update(ref(db, `users/${user.id}/followed`), {
                [userGuestInfo.id]: userGuestInfo.displayName
            });
            setCurrentUserAlreadyFollowed(true)
        } else {
            remove(ref(db, `users/${userGuestInfo.id}/followers/${user.id}`));
            remove(ref(db, `users/${user.id}/followed/${userGuestInfo.id}`));
            setCurrentUserAlreadyFollowed(false)
        }
    }

    const renderFollowButton = () => {
        if (!isMe && !isGuestBanned) {
            if (currentUserAlreadyFollowed) {
                return <div className={styles.userInfoButton} onClick={() => followHandler(false)}>Unfollow</div>
            }
            if (!currentUserAlreadyFollowed) {
                return <div onClick={() => followHandler(true)} className={styles.userInfoButton}>Follow</div>
            }
        } else if(isMe){
            return <div onClick={() => setArticlePopupIsOpen(true)} className={styles.userInfoButton}>Create an article</div>
        }else if(isGuestBanned && !isMe){
            return <div className={styles.blockedText}>You have been blocked by this user</div>
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
            data = userGuestInfo.followers ? userGuestInfo.followers : []
        }
        if (popupFor === 'followed') {
            data = userGuestInfo.followed ? userGuestInfo.followed : []
        }
        return <div className={styles.popup}>
            <div className={styles.popupHeader}>
                <div className={styles.popupClose} onClick={() => setPopupFor('')}>X</div>
            </div>
            {_.map(data, (item: string, key) => {
                return <div key={key} className={styles.followPopupUser}>
                    <div className={styles.followPopupUserPhoto}></div>
                    <Link className={styles.followPopupUserName} to={`/account/${key}`}>{item}</Link>
                </div>
            })}
        </div>
    }

    const renderArticles = () => {
        if (_.isEmpty(userGuestInfo.articles) || isGuestBanned) {
            return <div>There is no articles yet...</div>
        }
        return _.map(userGuestInfo.articles as any, article => {
            return <Article
                key={article.name}
                isMe={isMe}
                userName={userGuestInfo.displayName}
                idFromUrl={idFromUrl}
                articleTitle={article.name}
                articleText={article.text}
                articleComments={0}
                articleLikes={article.likes}
                articleViews={0}
            />
        })
    }

    const renderSocials = () => {
        const data = {
            instagram: () => <Instagram className={styles.socialIcons}/>
        }
        return <div className={styles.networks}>
            {_.map(userGuestInfo.socials, (item, key: keyof(typeof data)) => {
                return <a target='_blank' className={styles.socialItem} href={item}>{data[key]()}</a>
            })}
        </div>
    }

    const blockUserHandler = (type: string) => {
        if(type === 'block'){
            update(ref(db, `users/${user.id}/blockedUsers/`), {
                [idFromUrl]: true
            });
        }
        if(type === 'unblock'){
            remove(ref(db, `users/${user.id}/blockedUsers/${idFromUrl}`))
        }
        setUserMenuIsOpen(false)
    }

    const sendMessageButton = () => {
        window.localStorage.setItem('chatWith', userGuestInfo.id)
        window.localStorage.setItem('chatWithName', userGuestInfo.displayName)
        update(ref(db, `users/${user.id}/chats/${userGuestInfo.id + '_' + userGuestInfo.displayName}`), {
            temporaryChat: true
        });
    }

    return (
        <div>
            <div className={styles.userMain}>
                {articlePopupIsOpen && renderNewArticlePopup()}
                <div className={styles.userBlock}>
                    <div className={styles.userBlockLeft}>
                        <div className={styles.userPhoto}>{user.displayName && user.displayName.split('')[0]}</div>
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>@{userGuestInfo.displayName}</div>
                            <div className={styles.userInfoActivity}>
                                {popupFor && renderFollowInfoPopup()}
                                <div className={styles.userPosts}>{userGuestInfo.articles && !isGuestBanned ? _.size(userGuestInfo.articles) : 0} Posts</div>
                                <div
                                    onClick={() => setPopupFor('followers')}
                                    className={styles.userFollowers}
                                >
                                    {userGuestInfo.followers && !isGuestBanned ? _.size(userGuestInfo.followers) : 0} Followers
                                </div>
                                <div className={styles.userFollowed}
                                    onClick={() => setPopupFor('followed')}
                                >
                                    {userGuestInfo.followed && !isGuestBanned ? _.size(userGuestInfo.followed) : 0} Followed
                                </div>
                            </div>
                            {renderSocials()}
                            <div className={styles.userButtonsWrapper}>
                                {renderFollowButton()}
                                {!isMe && !isGuestBanned && <Link to={`/account/${user.id}/messages`} onClick={() => {
                                    sendMessageButton()
                                }} className={styles.userInfoButton}>Send a message</Link>}
                            </div>
                        </div>
                    </div>
                    <div className={styles.userMenuBlock}>
                        {!isMe && <div className={styles.userMenuWrapper} onClick={() => {
                            setUserMenuIsOpen(!userMenuIsOpen)
                        }}>
                            <MenuIcon className={styles.menuIcon} />
                        </div>}
                        {userMenuIsOpen && <div className={styles.articleMenu}>
                            {!isGuestBannedByMe 
                                ? <div className={styles.articleMenuItem} onClick={() => blockUserHandler('block')}>Block this user</div>
                                : <div className={styles.articleMenuItem} onClick={() => blockUserHandler('unblock')}>Unblock this user</div>
                            }
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