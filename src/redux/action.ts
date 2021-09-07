import { LOG_OUT, AUTH_SUCCESS } from "./constants";

export const saveUser = (userInfo: object) => {
    return {
        type: AUTH_SUCCESS,
        payload: userInfo
    }
}

export const logOut = () => {
    return {
        type: LOG_OUT
    }
}