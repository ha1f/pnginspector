<template>
  <div class="imageview">
    <img :src="imageSrc">
    <div class="chunk-container">
      <div v-for="(chunk, index) in chunks" :key="index" class="chunk-box">
        <div class="chunk-type">
          {{ chunk.type }}
          <br>
          <span>{{ chunk.size }} bytes</span>
        </div>
        <div class="chunk-entries">
          <div v-for="(value, key) in chunk" :key="key" class="chunk-entry">
            <span v-if="['size', 'type', 'dataOffset', 'endOffset', 'crc'].indexOf(key) < 0"> {{ key }}: {{ value }} </span>
          </div>
        </div>
      </div>
    </div>
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
    chunks: function() {
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
        return [{ 'type': 'error', 'size': 'error', 'message': 'This file is not PNG!' }]
      }

      return parser.getChunkInformation()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
img {
  max-width: 800px;
  max-width: 85%;
  max-height: 800px;
}
.chunk-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.chunk-box {
  background-color: bisque;
  max-width: 800px;
  width: 85%;
  padding: 10px;
  margin: 2px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
}
.chunk-type {
  max-width: 20%;
  width: 150px;
}
.chunk-type span {
  font-size: 0.7em;
}
.chunk-entries {
  text-align: left;
  width: 640px;
}
</style>
