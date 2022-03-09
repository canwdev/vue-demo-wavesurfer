<template>
  <div class="audio-player text-white" :class="{dense}">
    <div class="audio-cover relative-position">
      <img
        :src="data.cover"
      />
    </div>
    <div class="audio-right">
      <div class="info-wrap">
        <div class="title-view relative-position">
          <div class="title text-overflow">{{ data.title || '-' }}</div>
          <div class="subtitle text-overflow">{{ data.subtitle || '-' }}</div>
        </div>
      </div>

      <!--<audio ref="audio" style="display: none" :src="data.src"></audio>-->

      <div class="actions-wrap" :class="{disabled: isInitializing}">
        <div class="progress-bar">
          <div class="playtime time-current">{{ timeTo(currentTime) }}</div>
          <div ref="waveform" class="progress" :class="{'is-hidden': isLoading}"></div>
          <div v-if="isLoading" class="progress-loading">
            <progress :value="loadingProgress" max="100"></progress>
          </div>
          <div class="playtime time-duration">{{ timeTo(duration) }}</div>
        </div>

        <div class="play-buttons">
          <button
            class="relative-position btn-side"
            @click="playJump(-5)"
          >⏮</button>
          <button
            class="relative-position btn-center"
            @click="togglePlay"
          >{{paused? '▶': '⏸'}}</button>
          <button
            class="relative-position btn-side"
            @click="playJump(5)"
          >⏭</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import WaveSurfer from 'wavesurfer.js'
import {timeToHMS, timeToMS} from '@/utils'

export default {
  name: 'AudioPlayerWave',
  components: {
  },
  props: {
    autoplay: {
      type: Boolean,
      default: false
    },
    dense: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default() {
        return {
          cover: '',
          src: '',
          title: '',
          subtitle: ''
        }
      }
    },
  },
  data() {
    return {
      isInitializing: true, // 是正在否初始化，初始化前不可操作
      isLoading: true,
      loadingProgress: 0,
      form: {
        title: '',
        subtitle: ''
      },
      paused: true,
      currentTime: 0,
      duration: 0
    }
  },
  watch: {
    'data.src': {
      handler() {
        this.initAudio()
      },
      immediate: true
    }
  },
  mounted() {
    this.initAudio()
  },
  methods: {
    initAudio() {
      this.isInitializing = true
      this.isLoading = true
      this.paused = true
      this.loadingProgress = 0
      this.currentTime = 0
      this.duration = 0

      if (this.wavesurfer) {
        this.wavesurfer.destroy()
      }

      if (!this.data.src || !this.$refs.waveform) {
        return
      }
      const wavesurfer = WaveSurfer.create({
        container: this.$refs.waveform,
        height: this.dense ? 20 : 50,
        backend: 'MediaElement',
        waveColor: '#91b48f',
        progressColor: '#15601e',
        barWidth: 1,
        barHeight: 1, // the height of the wave
        barGap: 0,
        barMinHeight: 0,
        pixelRatio: 1,
        partialRender: false,
        barRadius: 1,
      })
      this.wavesurfer = wavesurfer
      wavesurfer.load(this.data.src)

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
    }
  }
}
</script>

<style lang='scss' scoped>
.audio-player {
  max-width: 100vw;
  width: 658px;
  background: #f5fff3;
  border: 1px solid #3eb756;
  border-radius: 3px;
  padding: 10px;
  padding-right: 23px;
  display: flex;

  .audio-cover {
    width: 140px;
    height: 140px;
    border-radius: 3px;
    overflow: hidden;
    margin-right: 20px;
    background: #c9e7c4;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

  }

  .audio-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .info-wrap {
      padding-top: 9px;

      .title-view {
        .title {
          font-size: 16px;
          margin-bottom: 10px;
          width: 95%;
        }

        .subtitle {
          font-size: 12px;
          width: 95%;
        }

        .icon-svg {
          width: 14px;
          height: 14px;
          position: absolute;
          right: 0;
          top: 0;
          cursor: pointer;
        }
      }
    }

    .actions-wrap {
      padding-bottom: 7px;
      display: flex;
      align-items: center;

      &.disabled {
        opacity: .5;
        pointer-events: none;
      }

      .progress-bar {
        flex: 1;
        margin-right: 20px;
        position: relative;
        display: flex;
        align-items: center;

        .playtime {
          font-size: 12px;
          width: 40px;
          text-align: center;
        }

        .time-duration {
          color: #14a431;
        }

        .progress {
          flex: 1;
          margin: 0 10px;

          &.is-hidden {
            opacity: 0;
          }
        }

        .progress-loading {
          position: absolute;
          top: 50%;
          left: 60px;
          right: 50px;
          transform: translateY(-50%);

          progress {
            width: 100%;
          }
        }
      }

      .play-buttons {
        button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: transparent;
          border: none;
          outline: none;
          cursor: pointer;
          color: white;

          .iconfont {
            display: inline-block;
          }
        }

        .btn-center {
          margin: 0 10px;
          background: linear-gradient(45deg, #68f15e, #3275da);

          .iconbofang1 {
            transform: translateX(10%);
          }
        }

        .btn-side {
          .iconfont {
            transform: scale(0.8);
          }
        }
      }
    }
  }

  /*缩小版*/
  &.dense {
    width: 320px;
    padding-right: 10px;

    .audio-cover {
      width: 66px;
      height: 66px;
      margin-right: 10px;
    }

    .info-wrap {
      padding-top: 0;
    }

    .actions-wrap {
      padding-bottom: 0;

      .play-buttons button {
        padding: 0;
        width: 24px;
        height: 24px;
        line-height: 24px;
      }

      .progress-bar {
        margin-right: 10px;

        .progress {
          margin: 0 4px;
        }
      }

      .iconfont {
        font-size: 12px;
      }
    }

    .subtitle {
      display: none;
    }
  }
}
</style>

