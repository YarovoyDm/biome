import { LOG_OUT, AUTH_SUCCESS } from "./constants";

export const saveUser = (userId: any, userName: any) => {
    return {
        type: AUTH_SUCCESS,
        payload: {
            userId,
            userName
        }
    }
}

export const logOut = () => {
    return {
        type: LOG_OUT
    }
}