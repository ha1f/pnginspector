<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <input @change="selectedFile" name="file" type="file" multiple>

    <div class="fileview-container">
      <file-view v-for="(file, index) in files" :key="index" :file="file" :version="version" />
    </div>
  </div>
</template>

<script>
import FileView from './FileView.vue'

export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      files: [],
      version: 0
    }
  },
  methods: {
    selectedFile: function (event) {
      event.preventDefault()
      
      console.log(`start reading ${event.target.files.length} files`)
      
      this.version += 1
      this.files = event.target.files
    }
  },
  components: {
    'file-view': FileView
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
</style>
