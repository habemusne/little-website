const bodyParser = require('body-parser')
const cors = require('cors')

module.exports = {
  serverMiddleware: [
    bodyParser.json(),
    cors(),
    '~/server',
  ],
  css: [
    '@/assets/variables.sass',
  ],
  /*
  ** Headers of the page
  */
  head: {
    title: 'hehe',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js project' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'vis.min.css' },
    ],
    script: [
      { src: 'vis.min.js' },
      { src: 'https://use.fontawesome.com/e9fbac4e72.js' },
      { src: 'https://code.jquery.com/jquery-3.2.1.min.js', integrity: "sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=", crossorigin: "anonymous" },
    ],
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    extend (config, ctx) {
      if (ctx.dev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
        })
      }
    }
  },
  build: {
    vendor: ['element-ui', 'vue-smoothscroll'],
  },
  plugins: [
    '~/plugins/element-ui',
    '~/plugins/vue-smoothscroll',
  ],
  modules: [
    'bootstrap-vue/nuxt',
    'nuxt-device-detect',
  ],
}
