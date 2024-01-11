// import { encryptFunction } from '../utils/crypto.js'

/*export default function ({ params, route, redirect }) {
  if (process.client) {
    // console.log(route.path, params.hasOwnProperty("id"))
    if (route.path.includes("/projects/") && params.hasOwnProperty("id")) {
      const { id } = params;
      const encryptedId = encryptFunction(id);
      window.history.replaceState(null, null, `${route.path}/${encryptedId}`);
      console.log(encryptedId)
    }
  }
  return Promise.resolve();

}
*/
