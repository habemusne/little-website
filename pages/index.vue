<template>
<projects></projects>
</template>

<script>
import Projects from '~/components/Projects'

export default {
  head: {
    script: [{ src: 'vis.min.js' }],
    link: [{ rel: 'stylesheet', href: 'vis.min.css' }],
  },
  components: {
    Projects,
  },
}
</script>
