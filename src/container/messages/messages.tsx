import React, { useEffect, useState } from 'react'
import * as _ from 'lodash'
import { getDatabase, ref, child, get, update, onValue } from "firebase/database";
import { RootStateOrAny, useSelector } from 'react-redux'
import moment from 'moment'
import styles from './messages.module.scss'
var cn = require('classnames');

const Messages = (props: any) => {
    const user = useSelector((state: RootStateOrAny) => {
        return state.auth.currentUser.userName
    })
    const db = getDatabase();
    const dbRef = ref(db);

    const [userChats, setUserChats] = useState<any[]>([])
    const [chatWith, setChatWith] = useState('')
    const [chatInput, setChatInput] = useState('')
    const [messages, setMessages] = useState<any>({
        message: '',
        date: '',
        author: ''
    })

    useEffect(() => {
        get(child(dbRef, `users/${props.match.params.nick}/followed`)).then((snapshot) => {
            if (snapshot.exists()) {
                setUserChats(_.values(snapshot.val()))
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
        setChatWith(window.localStorage.getItem('chatWith') || '')
    }, [])

    useEffect(() => {
        const messagesRef = ref(db, `users/${user}/chats/${chatWith}`);
        onValue(messagesRef, (snapshot) => {
            setMessages(snapshot.val());
        });
    }, [chatInput, chatWith])

    const renderChats = () => {
        return _.map(userChats, chat => {
            return <div className={styles.chatItem} onClick={() => {
                setChatWith(chat)
                window.localStorage.setItem('chatWith', chat)
            }}>{chat}</div>
        })
    }

    const onInputChanhge = (e: any) => {
        setChatInput(e.currentTarget.value)
    }

    const sendMessage = () => {
        update(ref(db, `users/${user}/chats/${chatWith}/${Date.now()}`),
            {
                message: chatInput,
                date: Date.now(),
                author: props.match.params.nick
            }
        );
        update(ref(db, `users/${chatWith}/chats/${user}/${Date.now()}`),
            {
                message: chatInput,
                date: Date.now(),
                author: user
            }
        );
        setChatInput('')
    }

    const renderMessage = () => {
        ///console.log('mess', _.sortBy(messages, [(o) =>  { return -o.date }])) !!! Important problem
        return _.map(_.sortBy(messages, [(date) => { return -date.date }]), message => {
            return <div className={cn(styles.messageBlock, { [styles.messageBlockIncoming]: message.author !== user })}>
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