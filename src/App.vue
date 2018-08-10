<template>
  <div id="app">
    <h1>PNG Inspector by ha1f</h1>
    <div class="notes">
      <span>PNGを読み込んで、チャンクデータを表示します</span><br>
      <span>未実装の形式も多いのでご了承ください</span><br>
      <span>複数選択可</span><br>
      <span>ローカルで動作し、ファイルがアップロードされることはありません</span>
    </div>
    <p>↓ファイルを選択して下さい↓</p>
    <router-view/>
    <p>Twitter: <a href="https://twitter.com/_ha1f" target="_blank">@_ha1f</a></p>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.notes {
  display: inline-block;
  max-width: 85%;
  max-width: 800px;
  border-width: 1px;
  border-color: black;
  border-style: solid;
  font-size: 0.9em;
  padding: 10px 50px;
}
</style>
