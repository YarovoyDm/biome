import React, {useState} from 'react'
import { getDatabase, ref, remove, update } from "firebase/database";
import * as _ from 'lodash'
import cn from 'classnames'
import { RootStateOrAny, useSelector } from 'react-redux'

import {ReactComponent as MenuIcon} from '../../images/menuIcon.svg';
import {ReactComponent as Like} from '../../images/like.svg';
import {ReactComponent as Comment} from '../../images/comment.svg';
import {ReactComponent as Views} from '../../images/views.svg';

import styles from './article.module.scss'

interface IArticleProps  {
    userName: string,
    articleTitle: string,
    articleText: string,
    articleLikes: object,
    articleComments: number,
    articleViews: number,
    isMe: Boolean,
    idFromUrl?: string
}

interface IArticleState {
    articleMenuIsOpen: Boolean
}

const Article: React.FC<IArticleProps> = (props) => {
    const [articleMenuIsOpen, setArticleMenuIsOpen] = useState<IArticleState['articleMenuIsOpen']>(false)
    const user = useSelector((state: RootStateOrAny) => {
        return state.auth.currentUser
    })  
    const db = getDatabase();
    const isILiked = _.includes(_.keys(props.articleLikes), user.id)

    const addLike = () => {
        isILiked 
        ?
        remove(ref(db, `users/${props.idFromUrl}/articles/${props.articleTitle}/likes/${user.id}`))
        : 
        update(ref(db, `users/${props.idFromUrl}/articles/${props.articleTitle}/likes`), {
            [user.id]: user.displayName
        })
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
                    <Like className={cn(styles.articleSvg, styles.articleLike, isILiked && styles.likeActive)}/> 
                    {_.size(props.articleLikes)}
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