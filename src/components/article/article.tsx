import styles from './article.module.scss'
import {ReactComponent as MenuIcon} from '../../images/menuIcon.svg';
import {ReactComponent as Like} from '../../images/like.svg';
import {ReactComponent as Comment} from '../../images/comment.svg';
import {ReactComponent as Views} from '../../images/views.svg';
import cn from 'classnames'

interface IArticle  {
    userName: string,
    articleTitle: string,
    articleText: string,
    articleLikes: number,
    articleComments: number,
    articleViews: number
}

const Article: React.FC<IArticle> = (props) => {
    return (
        <div className={styles.article}>
            <div className={styles.articleHeader}>
                <div className={styles.userBlock}>
                    <div className={styles.userPhoto}></div>
                    <div className={styles.userName}>{props.userName}</div>
                </div>
                <div className={styles.articleMenu}>
                    <MenuIcon className={styles.articleMenuButton}/>
                </div>
            </div>
            <div className={styles.articleMain}>
                <div className={styles.articleTitle}>{props.articleTitle}</div>
                <div className={styles.articleText}>{props.articleText}</div>
            </div>
            <div className={styles.articleFooter}>
                <div className={styles.articleLikes}>
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