<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <input @change="selectedFile" name="file" type="file">
  </div>
</template>

<script>
import PngParser from './../utils/PngParser.js'

export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  methods: {
    selectedFile: function (event) {
      console.log(`start reading ${event.target.files.length} files`)
      event.preventDefault()
      
      for (const file of event.target.files) {
        this.readFile(file)
      }
    },
    readFile: function(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        console.log(`file loaded: { name: ${file.name}, size: ${file.size} }`)

        const parser = new PngParser(e.target.result)

        if (!parser.validateIsPng()) {
          console.log('This file is not PNG!')
          return
        }

        const ihdr = parser.readIHDRChunkData()
        console.log(ihdr)

        parser.showInformation()
      }
      reader.readAsArrayBuffer(file)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
</style>
