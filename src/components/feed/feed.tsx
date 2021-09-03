import * as _ from 'lodash'
import Article from '../article/article'
import styles from './feed.module.scss'

const data = [
    {
        userName: 'yarovoy dmytro', 
        articleTitle: 'About my school', 
        articleText: 'Some text here beacause why not actually?', 
        articleLikes: 0, 
        articleComments: 11, 
        articleViews: 440
    },
    {
        userName: 'yarovoy dmytro', 
        articleTitle: 'About my school', 
        articleText: 'Some text here beacause why not actually?', 
        articleLikes: 40, 
        articleComments: 22, 
        articleViews: 130
    },
    {
        userName: 'yarovoy dmytro', 
        articleTitle: 'About my school', 
        articleText: 'Some text here beacause why not actually?', 
        articleLikes: 10, 
        articleComments: 9, 
        articleViews: 32
    },
    {
        userName: 'yarovoy dmytro', 
        articleTitle: 'About my school', 
        articleText: 'Some text here beacause why not actually?', 
        articleLikes: 0, 
        articleComments: 11, 
        articleViews: 440
    },
    {
        userName: 'yarovoy dmytro', 
        articleTitle: 'About my school', 
        articleText: 'Some text here beacause why not actually?', 
        articleLikes: 40, 
        articleComments: 22, 
        articleViews: 130
    },
    {
        userName: 'yarovoy dmytro', 
        articleTitle: 'About my school', 
        articleText: 'Some text here beacause why not actually?', 
        articleLikes: 10, 
        articleComments: 9, 
        articleViews: 32
    },
    {
        userName: 'yarovoy dmytro', 
        articleTitle: 'About my school', 
        articleText: 'Some text here beacause why not actually?', 
        articleLikes: 0, 
        articleComments: 11, 
        articleViews: 440
    },
    {
        userName: 'yarovoy dmytro', 
        articleTitle: 'About my school', 
        articleText: 'Some text here beacause why not actually?', 
        articleLikes: 40, 
        articleComments: 22, 
        articleViews: 130
    },
    {
        userName: 'yarovoy dmytro', 
        articleTitle: 'About my school', 
        articleText: 'Some text here beacause why not actually?', 
        articleLikes: 10, 
        articleComments: 9, 
        articleViews: 32
    },
]

const Feed = () => {

    const renderArticles = () => {
        return _.map(data, item => {
            return <Article 
                isMe={false}
                userName={item.userName}
                articleTitle={item.articleTitle}
                articleText={item.articleText}
                articleLikes={item.articleLikes}
                articleComments={item.articleComments}
                articleViews={item.articleViews}
            />
        })
    }

    return (
        <div className={styles.feed}>
            <div className={styles.feedMain}>
                {renderArticles()}
            </div>
        </div>
    )
}

export default Feed