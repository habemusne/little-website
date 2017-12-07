<template>
<el-row>
  <b-navbar toggleable="md" type="dark" variant="primary">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand href="#">Habemusne</b-navbar-brand>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav class="ml-auto">
        <b-nav-item href="#" right @click="$router.push('/')">Intro</b-nav-item>
        <b-nav-item href="#" right @click="$router.push('/projects')">My Projects</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</el-row>
</template>

<script>
</script>
