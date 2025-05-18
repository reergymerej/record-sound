import { getDb, getRms } from './util'

describe('sanity', () => {
  it('should be true', () => {
    expect(true).toBe(true)
  })
})

describe('getDb', () => {
  it('should return nothing for silence', () => {
    const buffer = Buffer.from([0, 0, 0, 0])
    const result = getDb(buffer)
    expect(result).toEqual(-Infinity)
  })

  xit('should return 0 for clipping', () => {
    const buffer = Buffer.from([32767, 32767, 32767, 32767])
    const result = getDb(buffer)
    expect(result).toEqual(0)
  })
})

describe('getRms', () => {
  it('should return 0 for silence', () => {
    const buffer = Buffer.from([0, 0, 0, 0])
    const result = getRms(buffer)
    expect(result).toEqual(0)
  })

  it('should return 1 for max values', () => {
    const buffer = Buffer.alloc(2)
    buffer.writeInt16LE(32767, 0)
    const result = getRms(buffer)
    expect(result).toBeCloseTo(1)
  })
})
