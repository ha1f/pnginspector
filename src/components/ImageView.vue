<template>
  <div class="imageview">
    <img :src="imageSrc">
    <div>{{ imageParams }}</div>
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
    imageParams: function() {
      return this.readProps(this.arrayBuffer)
    }
  },
  props: ['arrayBuffer'],
  methods: {
    readProps(arrayBuffer) {
      if (!arrayBuffer) {
        return
      }
      const parser = new PngParser(arrayBuffer)

      if (!parser.validateIsPng()) {
        console.log('This file is not PNG!')
        return ""
      }

      return parser.getChunkInformation()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
