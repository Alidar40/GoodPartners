import { ACTION_LOGIN_REQUEST, ACTION_LOGIN_SUCCESS, ACTION_LOGIN_FAIL, ACTION_LOGOUT } from '../actions/authentication-actions'

import { history } from '../../containers/app'

export const initialState = {
    isLoggedIn: false,
    name: "",
    isFetchingLogin: false,
    isLoginRequestFailed: false,

    isLoggingOut:false,

    error: "",
}

export function userReducer(state = initialState, action) {
    if (typeof state === 'undefined') {
        return initialState
    }

    switch (action.type) {
        case ACTION_LOGIN_REQUEST:
            return { ...state, isFetchingLogin: true}

        case ACTION_LOGIN_SUCCESS:
            return { ...initialState, isFetchingLogin: false, name: action.name, isLoggedIn: true, isLoginRequestFailed: false, }

        case ACTION_LOGIN_FAIL:
            return { ...state, isFetchingLogin: false, error: action.payload.error, isLoginRequestFailed: true }

        case ACTION_LOGOUT:
            return {...initialState, isLoggingOut: true }

        default:
            return state
    }
}
