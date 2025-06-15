## requires
brew install sox
sudo apt install sox

## convert raw to wav
./bin/convert yourfile.raw

## dev
npm run dev

## start
DEBUG=1 npm start

mac: system_profiler SPAudioDataType
linux: arecord -l

## todo
* specify inputs through env vars
* read devices from env var so we don't have to change code
* support multiple inputs concurrently
* add option to skip recording
* when logging, log input


sox -t coreaudio "MacBook Pro Microphone" output.wav
sox -t coreaudio "whatever" output.wav
sox -t coreaudio "USBAudio1.0" output.wav