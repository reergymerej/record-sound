# requires
brew install sox
sudo apt install sox


# convert raw to wav
sox -t raw -r 16000 -b 16 -c 1 -L -e signed-integer output.raw output.wav


## TODO
convert to ts