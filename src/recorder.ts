import env from './env'
import mic from './mic'

const { INPUT_DEVICE, DEBUG } = env

const micInstance = mic({
  rate: '16000',
  channels: '1',

  debug: DEBUG,
  device: INPUT_DEVICE,

  // run this on linux to find device:
  // arecord -l
  // > card 3: Device [USB Composite Device], device 0: USB Audio [USB Audio]
  // > Subdevices: 1/1
  // > Subdevice #0: subdevice #0
  // This means you'd use:
  // device: 'plughw:3,0'
})

type OnData = (data: Buffer) => void

export type Recorder = typeof recorder

// TODO: rename, this isn't a recorder, it's a listener for audio data
const recorder = {
  start: (onData: OnData) => {
    const micInputStream = micInstance.getAudioStream()
    const micInputStreamConfig = {
      data: onData,
      silence: () => {},
      error: (err: Error) => {},
      startComplete: () => {},
      stopComplete: () => {},
      pauseComplete: () => {},
      resumeComplete: () => {},
      processExitComplete: () => {},
    }
    for (const [event, handler] of Object.entries(micInputStreamConfig)) {
      micInputStream.on(event, handler)
    }
    micInstance.start()

    const stop = () => {
      micInputStream.removeAllListeners()
      micInstance.stop()
    }
    return stop
  },
}
export default recorder
