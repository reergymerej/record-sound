import fs from 'fs';

const sampleRate = 44100; // CD quality
const frequency = 440; // A4
const duration = 2; // seconds
const amplitude = 0.5; // 50% of max volume

const totalSamples = sampleRate * duration;
const buffer = Buffer.alloc(totalSamples * 2); // 2 bytes per sample (16-bit)

for (let i = 0; i < totalSamples; i++) {
  const time = i / sampleRate;
  const sample = Math.sin(2 * Math.PI * frequency * time);
  const value = Math.round(sample * amplitude * 32767); // scale to int16

  buffer.writeInt16LE(value, i * 2);
}

fs.writeFileSync('tone.raw', buffer);
