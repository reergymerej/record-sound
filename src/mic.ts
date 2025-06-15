import { spawn } from 'child_process'

// sox -t coreaudio "MacBook Pro Microphone" output.wav
// sox -t coreaudio "whatever" output.wav
// sox -t coreaudio "USBAudio1.0" output.wav

interface MicOptions {
  rate?: string
  channels?: string
  debug?: boolean
  device?: string
  // Add more options as needed
}

interface MicInstance {
  start: () => void
  stop: () => void
  getAudioStream: () => NodeJS.ReadableStream
}

const mic = (options: MicOptions): MicInstance => {
  const isMac = process.platform === 'darwin'
  const isLinux = process.platform === 'linux'
  console.log({ isLinux, isMac })

  if (isMac) {
    // macOS specific implementation
    const device = options.device || 'default'
    const audioStream = spawn('sox', [
      '-t',
      'coreaudio',
      device,
      '-r',
      options.rate || '16000',
      '-c',
      options.channels || '1',
      '-b',
      '16',
      '-e',
      'signed-integer',
      '-t',
      'wav',
      '-',
    ])

    return {
      start: () => {},
      stop: () => {},
      getAudioStream: () => audioStream.stdout,
    }
  }

  throw new Error(
    'Unsupported platform. This mic module currently supports only macOS.',
  )
}

export default mic
