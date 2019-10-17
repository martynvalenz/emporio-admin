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

export const actions = {
    setDarkTheme(context, data) {
        context.commit('setDarkTheme', data)
    }
}

export const mutations = {
    setUserName(state, payload){
        state.user.Name = payload
    },

    setDarkTheme(state, data){
        state.user.dark = data.dark;
    }
}



