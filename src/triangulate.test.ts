import { table } from 'console'

type Reference = {
  ts: number
}

type ReferenceRelations = {
  a: Reference
  b: Reference
  time: number
  distance?: number
}

type Info = {
  tsA: number
  tsB?: number
  deltaAB?: number
  closest?: Reference
  ratioDeltaAB?: number
  distanceFromBToOrigin?: number
}

type GetInfoArgs = {
  a: Reference
  b?: Reference
  abRelations?: ReferenceRelations
}
const getInfo = ({ a, b, abRelations }: GetInfoArgs): Info => {
  const deltaAB = b ? b.ts - a.ts : undefined
  const canGetRatio = abRelations && b && deltaAB !== undefined
  const ratioDeltaAB = canGetRatio ? deltaAB / abRelations.time : undefined
  const canGetDistanceFromB = ratioDeltaAB && abRelations?.distance
  const distanceFromBToOrigin = canGetDistanceFromB
    ? ratioDeltaAB * abRelations?.distance!
    : undefined
  return {
    tsA: a.ts,
    tsB: b?.ts,
    deltaAB,
    closest: b ? (a.ts < b.ts ? a : b) : undefined,
    ratioDeltaAB,
    distanceFromBToOrigin,
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

  describe('and static time between A and B', () => {
    it('should have ratio of difference in terms of tAB)', () => {
      const time = 100
      const a: Reference = {
        ts: 0,
      }
      const b: Reference = {
        ts: 20,
      }
      const abRelations: ReferenceRelations = {
        a,
        b,
        time,
      }
      const actual = getInfo({ a, b, abRelations })
      const expected: Info = {
        tsA: a.ts,
        tsB: b.ts,
        deltaAB: b.ts - a.ts,
        closest: a,
        ratioDeltaAB: (b.ts - a.ts) / time,
      }
      expect(actual).toEqual(expected)
    })

    describe('and a known distance between A and B', () => {
      it('should have the distance to origin B', () => {
        const time = 100
        const distance = 3 // feet
        const a: Reference = {
          ts: 0,
        }
        const b: Reference = {
          ts: 100,
        }
        const abRelations: ReferenceRelations = {
          a,
          b,
          time,
          distance,
        }
        const actual = getInfo({ a, b, abRelations })
        const expected: Info = {
          tsA: a.ts,
          tsB: b.ts,
          deltaAB: b.ts - a.ts,
          closest: a,
          ratioDeltaAB: (b.ts - a.ts) / time,
          distanceFromBToOrigin:
            // ratioDeltaAB
            ((b.ts - a.ts) / time) * distance,
        }
        expect(actual).toEqual(expected)
      })
    })
  })
})
