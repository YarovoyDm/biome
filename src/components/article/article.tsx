import React, {useState} from 'react'
import { getDatabase, ref, remove, update } from "firebase/database";
import cn from 'classnames'
import { RootStateOrAny, useSelector } from 'react-redux'

import {ReactComponent as MenuIcon} from '../../images/menuIcon.svg';
import {ReactComponent as Like} from '../../images/like.svg';
import {ReactComponent as Comment} from '../../images/comment.svg';
import {ReactComponent as Views} from '../../images/views.svg';

import styles from './article.module.scss'

interface IArticle  {
    userName: string,
    articleTitle: string,
    articleText: string,
    articleLikes: number,
    articleComments: number,
    articleViews: number,
    isMe: Boolean
}

const Article: React.FC<IArticle> = (props) => {
    const userNameLocal = window.localStorage.getItem('userName')
    const user = useSelector((state: RootStateOrAny) => {
        return state.auth.currentUser
    })  
    const db = getDatabase();
    const [articleMenuIsOpen, setArticleMenuIsOpen] = useState(false)

    const addLike = () => {
        update(ref(db, `users/${props.userName}/articles/${props.articleTitle}/likes/`), {
            [userNameLocal as string]: Date.now()
        });
    }

    const removeArticle = () => {
        remove(ref(db, `users/${user.id}/articles/${props.articleTitle}`))
        setArticleMenuIsOpen(false)
    }

    return (
        <div className={styles.article}>
            <div className={styles.articleHeader}>
                <div className={styles.userBlock}>
                    <div className={styles.userPhoto}></div>
                    <div className={styles.userName}>{props.userName}</div>
                </div>
                <div className={styles.articleMenuBlock}>
                    <div className={styles.articleMenuWrapper} onClick={() => setArticleMenuIsOpen(!articleMenuIsOpen)}>
                        <MenuIcon className={styles.articleMenuButton}/>
                    </div>
                    {articleMenuIsOpen && <div className={styles.articleMenu}>
                        {props.isMe 
                        ? 
                        <div className={styles.articleMenuItem} onClick={() => removeArticle()}>Delete an article</div> 
                        : 
                        <div className={styles.articleMenuItem}>Report</div>}  
                    </div>}
                </div>
            </div>
            <div className={styles.articleMain}>
                <div className={styles.articleTitle}>{props.articleTitle}</div>
                <div className={styles.articleText}>{props.articleText}</div>
            </div>
            <div className={styles.articleFooter}>
                <div className={styles.articleLikes} onClick={() => addLike()}>
                    <Like className={cn(styles.articleSvg, styles.articleLike)}/> 
                    {props.articleLikes}
                </div>
                <div className={styles.articleComments}>
                    <Comment className={styles.articleSvg}/> 
                    {props.articleComments}
                </div>    
                <div className={styles.articleViews}>
                    <Views className={styles.articleSvg}/> 
                    {props.articleViews}
                </div>
            </div>
        </div>
    )    
}

export default Article