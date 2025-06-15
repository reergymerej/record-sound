import mic from 'mic'

// read device from env var
const device = process.env.INPUT_DEVICE
const debug = !!process.env.DEBUG
console.log({ device, debug })

const micInstance = mic({
  rate: '16000',
  channels: '1',

  debug,
  device,

  //   exitOnSilence: 16,
  // [AVFoundation indev @ 0x15be12120] AVFoundation audio devices:
  // [AVFoundation indev @ 0x15be12120] [0] USBAudio1.0
  // [AVFoundation indev @ 0x15be12120] [1] MacBook Pro Microphone
  // [AVFoundation indev @ 0x15be12120] [2] USBAudio1.0
  // [AVFoundation indev @ 0x15be12120] [3] Microsoft Teams Audio"
  // device: 'USBAudio1.0',
  // device: '0'
  //
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
