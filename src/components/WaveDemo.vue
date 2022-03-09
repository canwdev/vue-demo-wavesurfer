<template>
  <div class="wave-demo">
    <div ref="waveformRef"
         class="wave-wrapper"
         :class="{loaded: !isLoading}"
    ></div>
    <div id="timeline" ref="timelineRef"></div>

    <div v-if="isLoading" class="loading-bar">
      <template v-if="loadingProgress<100">
        <progress :value="loadingProgress" max="100"></progress>
        Loading: {{ loadingProgress }}%
      </template>
      <template v-else>
        Analyzing, this takes time...
      </template>
    </div>

    <div v-if="!isInitializing" class="play-buttons">
      <span>
        {{ timeTo(currentTime) }} / {{ timeTo(duration) }}
      </span>
      <button
        class="relative-position btn-side"
        @click="playJump(-5)"
      >⏮
      </button>
      <button
        class="relative-position btn-center"
        @click="togglePlay"
      >{{ paused ? '▶' : '⏸' }}
      </button>
      <button
        class="relative-position btn-side"
        @click="playJump(5)"
      >⏭
      </button>
    </div>
  </div>
</template>

<script>
import WaveSurfer from 'wavesurfer.js'
import WaveSurferTimeline from 'wavesurfer.js/dist/plugin/wavesurfer.timeline'
import {timeToHMS, timeToMS} from '@/utils'

export default {
  name: "WaveDemo",
  props: {
    src: {
      type: String,
      default: ''
    },
    preAnalyzedData: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      isInitializing: true, // 是正在否初始化，初始化前不可操作
      isLoading: true,
      loadingProgress: 0,
      paused: true,
      currentTime: 0,
      duration: 0,
    }
  },
  watch: {
    src: {
      handler() {
        this.initWave()
      },
      immediate: true
    }
  },
  mounted() {
    this.initWave()
  },
  methods: {
    initWave() {
      this.isInitializing = true
      this.isLoading = true
      this.paused = true
      this.loadingProgress = 0
      this.currentTime = 0
      this.duration = 0

      if (this.wavesurfer) {
        this.wavesurfer.destroy()
      }

      if (!this.src || !this.$refs.waveformRef || !this.$refs.timelineRef) {
        return
      }
      const wavesurfer = WaveSurfer.create({
        container: this.$refs.waveformRef,
        waveColor: '#A8DBA8',
        progressColor: '#3B8686',
        backend: 'MediaElement',
        scrollParent: true,
        pixelRatio: 1,
        partialRender: true,
        plugins: [
          // WaveSurferRegions.create({
          //   regions: [
          //     {
          //       start: 0,
          //       end: 5,
          //       color: 'hsla(400, 100%, 30%, 0.1)'
          //     },
          //     {
          //       start: 10,
          //       end: 20,
          //       color: 'hsla(200, 50%, 70%, 0.1)'
          //     }
          //   ]
          // }),
          WaveSurferTimeline.create({
            container: this.$refs.timelineRef
          })
        ]
      })
      this.wavesurfer = wavesurfer

      if (this.preAnalyzedData) {
        fetch(this.preAnalyzedData)
          .then(response => {
            if (!response.ok) {
              throw new Error("HTTP error " + response.status);
            }
            return response.json();
          })
          .then(peaks => {
            console.log('loaded peaks! ', peaks);

            // load peaks into wavesurfer.js
            wavesurfer.load(this.src, peaks.data);
          })
          .catch((e) => {
            console.error('error', e);
          });
      } else {
        wavesurfer.load(this.src)
      }


      wavesurfer.on('ready', () => {
        console.log('ready')
        this.isInitializing = false
        this.audio = wavesurfer.backend
        this.duration = this.audio.getDuration()
        if (this.autoplay) {
          this.audio.play()
        }
        this.audio.on('audioprocess', () => {
          this.currentTime = this.audio.getCurrentTime()
        })

        this.audio.on('finish', () => {
          this.pause()
        })

        this.audio.on('play', () => {
          this.paused = false
        })

        this.audio.on('pause', () => {
          this.paused = true
        })
      })

      wavesurfer.on('loading', (progress) => {
        this.loadingProgress = progress
      })
      wavesurfer.on('waveform-ready', () => {
        console.log('waveform-ready')
        this.isLoading = false
      })
    },
    timeTo(ms) {
      return this.dense ? timeToMS(ms) : timeToHMS(ms)
    },
    togglePlay() {
      if (this.audio.isPaused()) {
        this.play()
      } else {
        this.pause()
      }
    },
    play() {
      this.audio.play()
      this.paused = false
    },
    pause() {
      this.audio.pause()
      this.paused = true
    },
    playJump(sec) {
      this.pause()
      if (sec === 0) {
        return
      }
      this.wavesurfer.skipForward(sec)
      this.play()
    },
  }
}
</script>

<style lang="scss" scoped>
.wave-demo {
  .wave-wrapper {
    border: 1px solid red;

    &.loaded {
      border-color: green;
    }
  }

  .play-buttons {
    display: flex;
    align-items: center;
    margin-top: 30px;
  }
}
</style>
