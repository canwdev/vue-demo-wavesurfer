const fs = require('fs')
const Path = require('path')
const child_process = require('child_process')
const iconv = require('iconv-lite')      // 乱码修复

const CONSOLE_PREFIX = '[PA] '
const audiWaveFormExePath = Path.join(__dirname, 'audiowaveform.exe')

const analyze = (filename) => {
  return new Promise((resolve, reject) => {

    const inputFilePath = Path.join(__dirname, `${filename}`)
    const outputFileName = `${filename}.json`
    const outputFilePath = Path.join(__dirname, outputFileName)
    const cmd = `${audiWaveFormExePath} -i ${inputFilePath} -o ${outputFilePath} --pixels-per-second 20 --bits 8`

    console.log(`${CONSOLE_PREFIX}cmd: ${cmd}`)

    const ps = child_process.spawn(cmd, [], {
      shell: true,
      stdio: ['inherit', 'pipe', 'pipe'], // 允许输出可交互的实时进度
      encoding: 'buffer',
      // stdio: 'ignore' // 忽略输出，防止程序阻塞
    })

    // console.log('ps', ps)

    let lastOutput
    ps.stdout.on('data', (data) => {
      data = iconv.decode(data, 'cp936')
      console.log(`${CONSOLE_PREFIX}[${ps.pid}] stdout`, data)
    })

    ps.stderr.on('data', (data) => {
      data = iconv.decode(data, 'cp936')
      lastOutput = data
      console.log(`${CONSOLE_PREFIX}[${ps.pid}] stderr`, JSON.stringify({data}))
    })

    ps.on('close', (code) => {
      console.log(`${CONSOLE_PREFIX}[${ps.pid}] close`, code)
      // console.log(`${CONSOLE_PREFIX}[${ps.pid}] lastOutput`, lastOutput)
      if (code === 0) {
        return resolve({
          code,
          data: lastOutput,
          outputFileName
        })
      } else {
        return reject({
          code,
          data: lastOutput
        })
      }
    })
  })
}

const arrayMax = (arr) => {
  return arr.reduce(function (p, v) {
    return ( p > v ? p : v );
  });
}

const scale_json = (filename) => {
  const inputFilePath = Path.join(__dirname, `${filename}`)
  const obj = JSON.parse(fs.readFileSync(inputFilePath, {encoding: 'utf-8'}))
  const data = obj.data || []

  const max_val = arrayMax(data)
  console.log('max_val', max_val)
  let new_data = data.map(x => {
    return Math.round((x / max_val) * 100) / 100
  })

  const newObj = {
    ...obj,
    data: new_data
  }
  fs.writeFileSync(inputFilePath, JSON.stringify(newObj), {encoding: 'utf-8'})
}



const run = async () => {
  // const data = await analyze(`long_clip.mp3`)
  // console.log('analyze resolve', data)
  // scale_json(data.outputFileName)
  scale_json('long_clip.mp3.json')
  console.log('scale_json done!')
}

run()
