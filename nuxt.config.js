import { resolve } from "path";

export default {
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: "bib-pm-front-app",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" }
    ],
    link: [
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700&display=swap"
      },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }
    ]
  },

  css: ["~/assets/global.scss"],
  axios: {
    // proxy: true,
    baseURL: process.env.VUE_APP_API_ENDPOINT
  },
  /// Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: ["~/plugins/plugins", "~/plugins/axios.js", "~/plugins/dayjs.js"],
  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: [
    { path: "~/components/", pathPrefix: false },
    { path: "~/elements/", pathPrefix: false },
    { path: "~/../bib-shared/components/", pathPrefix: false }
  ],
  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    "cookie-universal-nuxt",
    "@nuxtjs/axios",
    "@nuxtjs/auth",
    "@nuxtjs/proxy",
    "@nuxtjs/dotenv",
    "@nuxtjs/dayjs",
    "@nuxtjs/style-resources"
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [],
  styleResources: {
    scss: [
      "../bib-shared/css/colors.scss",
      "../bib-shared/css/variables.scss",
      "../bib-shared/css/mixins.scss",
      "../bib-shared/css/utilities.scss",
      "../bib-shared/css/basic.scss",
      "~/assets/variable.scss"
    ]
  },
  // router: {
  //   // base: '/dashboard',
  //   middleware: ["auth"]
  // },
  serverMiddleware: ["~/middleware/redirects"],
  // proxy: {
  //   '/auth': {
  //     target: process.env.VUE_APP_API_ENDPOINT+'/auth',
  //     pathRewrite: { '^/auth': '' },
  //     changeOrigin: true
  //   },
  // },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    extend(config, { loaders }) {
      loaders.scss.additionalData = '@use "sass:math";';
    }
  },
  alias: {
    config: resolve(__dirname, "./config"),
    services: resolve(__dirname, "./services"),
    dummy: resolve(__dirname, "./dummy")
  },
  loadingIndicator: {
    name: "circle",
    color: "#3B8070",
    background: "transparent"
  },
  dayjs: {
    locales: ["en", "ca"],
    defaultLocale: "en",
    defaultTimeZone: "Canada/Toronto",
    plugins: ["utc", "timezone", "weekday", "localizedFormat", "isSameOrAfter"]
  },
  server: {
    port: 4000
  },
  // auth: {
  //   plugins: ["~/plugins/auth"],
  //   redirect: {
  //     login:
  //       process.env.AUTH_REDIRECT_URL + process.env.VUE_APP_URL + "/dashboard",
  //     callback: "/auth/login",
  //     home: "/"
  //   },
  //   strategies: {
  //     local: {
  //       autoFetchUser: false,
  //       tokenName: "Authorization",
  //       required: true,
  //       tokenType: "Bearer"
  //     }
  //   }
  // }
};