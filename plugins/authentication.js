export default async function ({ $axios, store, env, redirect, app, $auth }) {
  let $cookie = env.SSO_COOKIE_NAME;

  // dhruv
  let c = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrNjFZUWRKNko3bGRPR3BKIiwic3ViZSI6ImRocnV2LnNoYXJtYUBxc3N0ZWNobm9zb2Z0LmNvbSIsInN1YnMiOiJBQ1RJVkUiLCJzdWJiIjoiTzNHV3BtYms1ZXpKbjRLUiIsInN1YmJzIjoiQ0xJRU5UIiwic3ViciI6IkFETUlOIiwic3ViYyI6IkNhbmFkYSIsImVudiI6ImRldiIsImlhdCI6MTcwNDI3NTIxOTY0NCwiZXhwIjoxNzEyMDUxMjE5NjQ0LCJqdGkiOiIxY2UwZWFjYi1mYjRjLTQwMjEtOTZkNy1iY2IxYzA5MjliMjAifQ.e6027KkRd-i4mv3qu2NtKRLSu1w5NFJTElfsgA1kU-0"

  // vishwajeet
  // let c = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJES2dsOWF2Mk53bmFHMXZ6Iiwic3ViZSI6InZpc2h3YWplZXQubWFuZGFsQHFzc3RlY2hub3NvZnQuY29tIiwic3VicyI6IkFDVElWRSIsInN1YmIiOiJPM0dXcG1iazVlekpuNEtSIiwic3ViYnMiOiJDTElFTlQiLCJzdWJyIjoiVVNFUiIsInN1YmMiOiJDYW5hZGEiLCJlbnYiOiJkZXYiLCJpYXQiOjE3MDQyNzc0NDUyMDcsImV4cCI6MTcxMjA1MzQ0NTIwNywianRpIjoiZmE0MTE0YzYtZDZjZS00OTgyLTg5NmYtMDY3MWU4NWU1NTRkIn0.ATZRpEbc0jRdEwrBe5ZfCm1JOVNluxSskC7oRWvKUvY"

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
