import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex)
const persistedData = new createPersistedState({
    key:'spa_training',
    storage: localStorage,
    reducer : state => ({
        isLoggedin : state.isLoggedin,
        loggedInUser : state.loggedInUser
    })
})

export default new Vuex.Store({
    state:{
        isLoggedin : false,
        loggedInUser : null,
        allUsers : [],
    },

    actions:{
        getUsers(context){
            axios.get('/api/users')
                    .then( (response) => {
                    // this.users = response.data
                    context.commit('getUsers', response.data)
                    } )
        },

        login(context){
            let user_data = {
                id : 1, 
                name : 'karl'
            }

            axios.post('/api/getUser', user_data)
                    .then(response => {
                        context.commit('login', response.data);
                    })
        },

        logout(context){
            context.commit('logout');
        }
    },

    mutations:{
        login(state, data){
            state.loggedInUser = data
            state.isLoggedin = true
        },

        logout(state){
            state.loggedInUser = {}
            state.isLoggedin = false;
        },

        getUsers(state, data){
            state.allUsers = data
        }
    },
    getters:{},
    plugins: [persistedData]
});