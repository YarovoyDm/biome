import React, { useEffect, useState } from 'react'
import * as _ from 'lodash'
import { getDatabase, ref, child, get, update, onValue } from "firebase/database";
import { RootStateOrAny, useSelector } from 'react-redux'
import moment from 'moment'
import styles from './messages.module.scss'
var cn = require('classnames');

const Messages = (props: any) => {
    const user = useSelector((state: RootStateOrAny) => {
        return state.auth.currentUser
    })
    const db = getDatabase();
    const dbRef = ref(db);

    const [userChats, setUserChats] = useState({})
    const [chatWith, setChatWith] = useState('')
    const [chatWithName, setChatWithName] = useState('')
    const [chatInput, setChatInput] = useState('')
    const [messages, setMessages] = useState<any>({
        
    })

    useEffect(() => {
        get(child(dbRef, `users/${user.id}/chats/`)).then((snapshot) => {
            if (snapshot.exists()) {
                console.log('aaa', snapshot.val())
                setUserChats(snapshot.val())
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
        setChatWith(window.localStorage.getItem('chatWith') || '')
        setChatWithName(window.localStorage.getItem('chatWithName') || '')
        // console.log('1', chatWith)
        // const messagesRef = ref(db, `users/${user.id}/chats/${chatWith + '_' + chatWithName}/messages`);
        // onValue(messagesRef, (snapshot) => {
        //     console.log('2', messagesRef)
        //     setMessages(snapshot.val());
        // });
    }, [])

    useEffect(() => {
        const messagesRef = ref(db, `users/${user.id}/chats/${chatWith + '_' + chatWithName}/messages`);
        console.log('1', chatWith, chatWithName)
        chatWith && onValue(messagesRef, (snapshot) => {
            setMessages(snapshot.val());
        });
    }, [chatInput, chatWith])

    const renderChats = () => {
        return _.map(userChats, (chat, key) => {
            return <div className={styles.chatItem} onClick={() => {
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
            console.log('mess', message)
            return <div className={cn(styles.messageBlock, { [styles.messageBlockIncoming]: message.author !== user.displayName })}>
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