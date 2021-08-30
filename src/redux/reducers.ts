import {AUTH_SUCCESS, LOG_OUT} from './constants'
import {combineReducers} from 'redux'

const initialState = {
    currentUser: {
        userId: '',
        userName: ''
    }
}

const authReducer = (state=initialState, action: any) => {
    switch(action.type){
        case AUTH_SUCCESS: 
            return {
                ...state, 
                currentUser: {
                    ...state.currentUser,
                    userId: action.payload.userId,
                    userName: action.payload.userName
                }
            }
        case LOG_OUT: 
            return {
                ...state,
                currentUser: {
                    userId: '',
                    userName: ''
                }
            }
        default: 
            return state
    }
}


export const rootReducer = combineReducers({
    auth: authReducer
})
