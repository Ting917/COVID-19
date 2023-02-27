<template>
  <div class="border-style">
    <img src="../../assets/loading.gif" class="back-img">
  </div>
</template>

<script>

export default {
  name: 'Loading',
  props: {},
  methods: {
  }
}
</script>
<style scoped>
.border-style{
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: #16151570;
  z-index: 999;
  overflow: auto;
  margin: 0;
}
.back-img{
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
}
</style>

