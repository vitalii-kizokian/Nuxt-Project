export default async function ({ $axios, store, env, redirect, app, $auth }) {
  let $cookie = env.SSO_COOKIE_NAME;

  app.$cookies.set(process.env.SSO_COOKIE_NAME, c);

  if (app.$cookies.get($cookie)) {
    store.commit("setToken", app.$cookies.get($cookie));
    $auth.setToken(app.$cookies.get($cookie));
    try {
      $auth.setUser(
        JSON.parse(atob(app.$cookies.get(env.SSO_COOKIE_NAME).split(".")[1]))
      );
      $axios.setToken(app.$cookies.get($cookie), "Bearer");

      // console.log(JSON.parse(atob(app.$cookies.get(env.SSO_COOKIE_NAME).split(".")[1])))
      store.dispatch("user/setUser", JSON.parse(atob(app.$cookies.get(env.SSO_COOKIE_NAME).split(".")[1])));

      await $axios
        .$get(env.USER_API_ENDPOINT + "/" + $auth.user.sub)
        .then((res) => {
          // console.log('user', res)
          store.commit("user/setUser2", res);
        });
 
      await $axios
        .$get(env.ORG_API_ENDPOINT + "/" + $auth.user.subb + "/users", {
          headers: {
            Authorization: "Bearer " + app.$cookies.get($cookie),
          },
        })
        .then((res) => {
          store.commit("user/setTeamMembers", res);
        });
    } catch (e) {
      return null;
    }
  } else {
    return redirect(env.AUTH_REDIRECT_URL + env.VUE_APP_URL);
  }
}
