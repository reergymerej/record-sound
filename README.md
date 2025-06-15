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

## TODO
* set output by env var, record wav and/or log
* specify inputs through env vars
* support multiple inputs concurrently
* read devices from env var so we don't have to change code
* add option to skip recording
* when logging, log input
