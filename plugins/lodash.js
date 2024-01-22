import Vue from 'vue';
// import VueLodash from 'vue-lodash';
import lodash from 'lodash';
/*import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
import cloneDeep from 'lodash/cloneDeep'
import delay from 'lodash/delay'*/

// Install lodash globally
Vue.prototype.$lodash = lodash;
// Vue.use(VueLodash, { lodash: { debounce, throttle, cloneDeep, delay } });
