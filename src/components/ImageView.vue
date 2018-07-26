<template>
  <div class="imageview">
    <img :src="imageSrc">
  </div>
</template>

<script>
import PngParser from './../utils/PngParser.js'

export default {
  name: 'ImageView',
  data () {
    return {
    }
  },
  computed: {
    imageSrc: function() {
      if (!this.arrayBuffer) {
        return ""
      }
      return 'data:image/png;base64,' + btoa(Array.from(new Uint8Array(this.arrayBuffer), e => String.fromCharCode(e)).join(''))
    },
  },
  props: ['arrayBuffer'],
  methods: {
    reload() {
      this.readProps(this.arrayBuffer)
    },
    readProps(arrayBuffer) {
      if (!arrayBuffer) {
        return
      }
      const parser = new PngParser(arrayBuffer)

      if (!parser.validateIsPng()) {
        console.log('This file is not PNG!')
        return
      }

      const ihdr = parser.readIHDRChunkData()
      console.log(ihdr)

      parser.showInformation()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
