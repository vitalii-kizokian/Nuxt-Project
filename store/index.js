export const state = () => ({
    token: null,
    isLightTheme: true,
})

export const mutations = {
    setToken(state, payload) {
        state.token = payload;
    },
    setTheme(state, payload){
        state.isLightTheme = payload
    },
    setIsLightTheme(state, value) {
        if (process.client) {
          this.$cookies.set("isLightTheme", value, {
            path: "/",
            domain: location.host.includes("business-in-a-box.com")
              ? ".business-in-a-box.com"
              : undefined,
            maxAge: 60 * 60 * 24 * 30,
          });
        }
        state.isLightTheme = value;
      },
}

export const getters = {
    getToken(state) {
        return state.token;
    },
    getTheme(state){
        return state.isLightTheme
    },
  };

export const actions = {
    nuxtServerInit ({ commit }, { store, route, app }) {
        
        let token = app.$cookies.get('b_ssojwt')
        commit('setToken', token);
        // extract user
        var base64Url = token.split(".")[1];
        var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
         
        const buffer = Buffer.from(base64, 'base64');
        const jsonPayload = buffer.toString('utf-8'); 
         
        const payloadObject = JSON.parse(jsonPayload);
        // console.log(payloadObject)

        store.dispatch("user/setUser", payloadObject);

        if (app.$cookies.get("isLightTheme")) {
            commit("setIsLightTheme", app.$cookies.get("isLightTheme"));
        }
    }
  }
