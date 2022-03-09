<template>
  <div id="app">
    <AudioPlayerWave
      :data="musicData"
    />
    <WaveDemo
      :src="musicData.src"
      :pre-analyzed-data="musicData.preAnalyzedData"
    />
  </div>
</template>

<script>
import AudioPlayerWave from './components/AudioPlayerWave.vue'
import WaveDemo from './components/WaveDemo.vue'

export default {
  name: 'App',
  components: {
    AudioPlayerWave,
    WaveDemo
  },
  data() {
    return {
      musicData: {
        cover: require('@/assets/logo.png'),
        src: '/test/test.mp3',
        // preAnalyzedData: '/test/test.mp3.json',
        // src: '/test/long_clip.mp3',
        // preAnalyzedData: '/test/long_clip.mp3.json',
        title: 'Vue Player',
        subtitle: 'WaveSurfer'
      }
    }
  },
}
</script>

<style lang="scss">
#app {
}
</style>
