<template>
  <div class="container">
    <div class="logos">
      <el-image :src="imgUrl" class="logo" />
      <span class="logo_desc">一起为更好的教育</span>
    </div>
    <div class="crumbs">
      <!-- <span class="crumbItem" @click="jumpIndex">首页</span> -->
      <!-- <span class="crumbItem">/</span> -->
      <span class="crumbItem">联系我们</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      imgUrl: require('@/assets/logo.png')
    }
  },
  methods: {
    jumpIndex() {
      location.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
.container{
  $height:100px;
  padding:0 20px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  .logos{
    display: flex;
    align-items: center;
    .logo{
      width: $height;
      height: $height;
    }
    .logo_desc{
      font-size: 22px;
      color: #333;
      margin-left: 20px;
    }
  }
  .crumbs{
    font-size: 22px;
    font-weight: 500;
    color: #333;
    .crumbItem{
      cursor: pointer;
    }
    .crumbItem:hover{
      color: rgb(56, 122, 245);
    }
  }
}

</style>
