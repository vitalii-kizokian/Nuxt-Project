export default async function ({ $axios, store, env, redirect, app, $auth }) {
  let $cookie = env.SSO_COOKIE_NAME;

  // let c = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJES2dsOWF2Mk53bmFHMXZ6Iiwic3ViZSI6InZpc2h3YWplZXQubWFuZGFsQHFzc3RlY2hub3NvZnQuY29tIiwic3VicyI6IkFDVElWRSIsInN1YmIiOiJPM0dXcG1iazVlekpuNEtSIiwic3ViYnMiOiJDTElFTlQiLCJzdWJyIjoiVVNFUiIsInN1YmMiOiJDYW5hZGEiLCJlbnYiOiJkZXYiLCJpYXQiOjE2OTY0MDk1MjkwMTYsImV4cCI6MTcwNDE4NTUyOTAxNiwianRpIjoiNzZhZGIwMWEtMmVlMy00YTAzLWJhZGMtMjU5NGQ0YThmODE2In0.7yryx4JhYce42qtAdTQlbl9dglpcalfWYQdYVsMIJs8"

  // bbbtest (admin)
  let c = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJnRUxZcWFRV1FZTWRuamsyIiwic3ViZSI6ImJiYnRlc3RAbWFpbGluYXRvci5jb20iLCJzdWJzIjoiQUNUSVZFIiwic3ViYiI6InFMa3pQZHlQMGpXYlFyb3YiLCJzdWJicyI6IkNMSUVOVCIsInN1YnIiOiJBRE1JTiIsInN1YmMiOiJJbmRpYSIsImVudiI6ImRldiIsImlhdCI6MTcwMTk0ODg0MjczMywiZXhwIjoxNzA5NzI0ODQyNzMzLCJqdGkiOiJjOWJlNWQ4MC1kYjAzLTQ3YzEtYjcxYy0wZTIzNzYwNWU3Y2QifQ.WkxX5YGODEbnkvOzHRjveKUSC0SGljF4kKCnQnS_Rik"

  // let c = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ3TkpBUGRSNlJaemRHeU9YIiwic3ViZSI6ImNjY3Rlc3RAbWFpbGluYXRvci5jb20iLCJzdWJzIjoiQUNUSVZFIiwic3ViYiI6InFMa3pQZHlQMGpXYlFyb3YiLCJzdWJicyI6IkNMSUVOVCIsInN1YnIiOiJVU0VSIiwic3ViYyI6IkluZGlhIiwiZW52IjoiZGV2IiwiaWF0IjoxNzAxOTMwNDM4MTA4LCJleHAiOjE3MDk3MDY0MzgxMDgsImp0aSI6ImZmZGU2MDU4LTRlNTUtNDQ5NS04ZjZjLWE5ZjM4MmQyMjllMSJ9.xyctSfy_ZzXc54EsCjUG8gJXf3PEtszKp3M_h6OG4PE"

  app.$cookies.set(env.SSO_COOKIE_NAME, c);

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
