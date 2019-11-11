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
    },

    changeServicesControlView(context, data){
        context.commit('setServicesControlView', data)
    }
}

export const mutations = {
    setUserName(state, payload){
        state.user.Name = payload
    },

    setDarkTheme(state, data){
        state.user.dark = data.dark;
    },

    setServicesControlView(state, data){
        state.user.service_control = data.service_control;
    }
}



