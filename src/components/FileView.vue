<template>
  <div class="fileview">
    <span>{{ filename }}</span>
    <image-view :arrayBuffer="arrayBuffer"  ref="imageview" />
  </div>
</template>

<script>
import ImageView from './ImageView.vue'

export default {
  name: 'ImageView',
  data () {
    return {
      current_version: null,
      arrayBuffer: null
    }
  },
  computed: {
    filename: function() {
      return this.file.name
    }
  },
  props: ['file', 'version'],
  mounted () {
    console.log('fileview: mounted')
    this.reload()
  },
  beforeUpdate () {
    console.log('fileview: beforeUpdate', this.file.name)
    this.reload()
  },
  methods: {
    reload: function() {
      if (this.current_version == null || this.current_version != this.version) {
        this.current_version = this.version

        const reader = new FileReader()
        reader.onload = (e) => {
          console.log(`file loaded: { name: ${this.file.name}, size: ${this.file.size} }`)
          this.arrayBuffer = e.target.result
        }
        reader.readAsArrayBuffer(this.file)
      }
    }
  },
  components: {
    'image-view': ImageView
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
