import { table } from 'console'

type Reference = {
  ts: number
}

type TimeBetweenReferences = {
  a: Reference
  b: Reference
  time: number
}

type Info = {
  tsA: number
  tsB?: number
  deltaAB?: number
  closest?: Reference
  ratioDeltaAB?: number
}

type GetInfoArgs = { a: Reference; b?: Reference; tAB?: TimeBetweenReferences }
const getInfo = ({ a, b, tAB }: GetInfoArgs): Info => {
  const deltaAB = b ? b.ts - a.ts : undefined
  const canGetRatio = tAB && b && deltaAB !== undefined
  return {
    tsA: a.ts,
    tsB: b?.ts,
    deltaAB,
    closest: b ? (a.ts < b.ts ? a : b) : undefined,
    ratioDeltaAB: canGetRatio ? deltaAB / tAB.time : undefined,
  }
}

describe('given a single point', () => {
  it('has no information other than ts', () => {
    const a: Reference = {
      ts: 0,
    }
    const actual = getInfo({ a })
    const expected: Info = {
      tsA: a.ts,
    }
    expect(actual).toEqual(expected)
  })
})

describe('given two points', () => {
  it('should have ts for each point', () => {
    const a: Reference = {
      ts: 100,
    }
    const b: Reference = {
      ts: 10,
    }
    const actual = getInfo({
      a,
      b,
    })
    const expected: Info = {
      tsA: a.ts,
      tsB: b.ts,
      deltaAB: b.ts - a.ts,
      closest: b,
    }
    expect(actual).toEqual(expected)
  })
})

describe('given two points and time (static time between A and B)', () => {
  it('should have ratio of difference in terms of tAB)', () => {
    const time = 100

    const a: Reference = {
      ts: 20,
    }
    const b: Reference = {
      ts: 40,
    }
    const tAB: TimeBetweenReferences = {
      a,
      b,
      time,
    }
    const actual = getInfo({ a, b, tAB })
    const expected: Info = {
      tsA: a.ts,
      tsB: b.ts,
      deltaAB: b.ts - a.ts,
      closest: a,
      ratioDeltaAB: (b.ts - a.ts) / time,
    }

    console.log('actual', actual)
    expect(actual).toEqual(expected)
  })
})
