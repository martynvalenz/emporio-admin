import { userInfo } from "os";

// export const state = () => ({
//     authenticated: '',
//     user: {}
// })

export const getters = {
    authenticated(state){
        return state.loggedIn;
    },

    user(state){
        return state.user;
    }
}

export const mutations = {
    setUserName(state, payload){
        state.user.Name = payload
    }
}

export const actions = {

}

