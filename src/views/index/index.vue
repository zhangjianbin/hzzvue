<template>
  <div class="container">
    <Header />
    <Main />
    <Footer />
  </div>
</template>

<script>
import Header from './components/header'
import Main from './components/main'
import Footer from './components/footer'
export default {
  components: {
    Header,
    Main,
    Footer
  }
}
</script>

<style lang="scss" scoped>
  .container{
    width: 100%;
    min-width: 760px;
    max-width: 1300px;
    margin:0 auto;
    background-color: #fff;
    overflow: hidden;
  }
</style>
