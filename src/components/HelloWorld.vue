<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <input @change="selectedFile" name="file" type="file" multiple>

    <div class="imageview-container">
      <image-view v-for="(buffer, index) in buffers" :key="index" :arrayBuffer="buffer" />
    </div>
  </div>
</template>

<script>
import ImageView from './ImageView.vue'

export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      buffers: []
    }
  },
  methods: {
    selectedFile: function (event) {
      event.preventDefault()
      
      console.log(`start reading ${event.target.files.length} files`)
      
      this.buffers = []
      for (const file of event.target.files) {
        this.readFile(file)
      }
    },
    readFile: function(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        console.log(`file loaded: { name: ${file.name}, size: ${file.size} }`)

        this.buffers.push(e.target.result)
      }
      reader.readAsArrayBuffer(file)
    }
  },
  components: {
    'image-view': ImageView
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
</style>
