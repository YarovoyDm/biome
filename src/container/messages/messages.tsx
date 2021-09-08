import React, { useEffect, useState } from 'react'
import * as _ from 'lodash'
import { getDatabase, ref, update, onValue } from "firebase/database";
import { RootStateOrAny, useSelector } from 'react-redux'

import styles from './messages.module.scss'

var cn = require('classnames');

interface IMessages {
    userChats: object,
    chatWith: string,
    chatWithName: string,
    chatInput: string,
    messages: {
        contents:{
            date: number,
            message: string,
            author: string
        }
    }
}

const Messages: React.FC = () => {
    const user = useSelector((state: RootStateOrAny) => {
        return state.auth.currentUser
    })
    const db = getDatabase();

    const [userChats, setUserChats] = useState<IMessages['userChats']>({})
    const [chatWith, setChatWith] = useState<IMessages['chatWith']>('')
    const [chatWithName, setChatWithName] = useState<IMessages['chatWithName']>('')
    const [chatInput, setChatInput] = useState<IMessages['chatInput']>('')
    const [messages, setMessages] = useState<IMessages['messages']>()

    useEffect(() => {
        setChatWith(window.localStorage.getItem('chatWith') || '')
        setChatWithName(window.localStorage.getItem('chatWithName') || '')
        const chatsRef = ref(db, `users/${user.id}/chats`);
        onValue(chatsRef, (snapshot) => {
            setUserChats(snapshot.val());
        });
    }, [user])

    useEffect(() => {
        const messagesRef = ref(db, `users/${user.id}/chats/${chatWith + '_' + chatWithName}/messages`);
        chatWith && onValue(messagesRef, (snapshot) => {
            setMessages(snapshot.val());
        });
    }, [chatInput, chatWith, user])

    const renderChats = () => {
        return _.map(userChats, (chat, key) => {
            return <div key={key} className={styles.chatItem} onClick={() => {
                setChatWith(key.split('_')[0])
                setChatWithName(key.split('_')[1])
                window.localStorage.setItem('chatWith', key.split('_')[0])
                window.localStorage.setItem('chatWithName', key.split('_')[1])
            }}>{key.split('_')[1]}</div>
        })
    }

    const onInputChanhge = (e: any) => {
        setChatInput(e.currentTarget.value)
    }

    const sendMessage = () => {
        chatInput &&
        update(ref(db, `users/${user.id}/chats/${chatWith + '_' + chatWithName}/messages/${Date.now()}`),
            {
                message: chatInput,
                date: Date.now(),
                author: user.displayName
            }
        );
        chatInput &&
        update(ref(db, `users/${chatWith}/chats/${user.id + '_' + user.displayName}/messages/${Date.now()}`),
            {
                message: chatInput,
                date: Date.now(),
                author: user.displayName
            }
        );
        setChatInput('')
    }

    const renderMessage = () => {
        if(!messages){return null}
        ///console.log('mess', _.sortBy(messages, [(o) =>  { return -o.date }])) !!! Important problem
        return _.map(_.sortBy(messages, [(date) => { return -date.date }]), message => {
            return <div key={message.date} className={cn(styles.messageBlock, { [styles.messageBlockIncoming]: message.author !== user.displayName })}>
                <div className={styles.messageWrapper}>
                    {/* <div className={styles.messageDate}>{moment(message.date).startOf('hour').fromNow()}</div> */}
                    <div className={styles.messageText}>{message.message}</div>
                </div>
            </div>
        })
    }

    return (
        <div className={styles.messages}>
            <div className={styles.messagesMain}>
                <div className={styles.mainChats}>
                    {renderChats()}
                </div>
                <div className={styles.chatBlock}>
                    <div className={styles.chatBody}>{renderMessage()}</div>
                    <div className={styles.chatFooter}>
                        <input onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                sendMessage()
                            }
                        }} value={chatInput} onChange={(e) => onInputChanhge(e)} className={styles.chatInput} placeholder='Type something...' />
                        <div className={styles.chatSend} onClick={() => sendMessage()}>Send</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Messages