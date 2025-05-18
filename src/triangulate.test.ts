describe('triangulate', () => {
  it('should return coords', () => {
    type Coords = {
      x: number
      y: number
    }

    type CoordsAndValue = Coords & {
      value: number
    }

    const triangulate = (
      a: CoordsAndValue,
      b: CoordsAndValue,
      c: CoordsAndValue,
    ): Coords => {
      // return the centroid of the triangle
      const x = (a.x + b.x + c.x) / 3
      const y = (a.y + b.y + c.y) / 3
      return { x, y }
    }

    const a: CoordsAndValue = { x: 0, y: 0, value: 0 }
    const b: CoordsAndValue = { x: 3, y: 0, value: 0 }
    const c: CoordsAndValue = { x: 0, y: 4, value: 0 }
    const expected: Coords = { x: 1, y: expect.closeTo(1.33) }
    const coords = triangulate(a, b, c)
    expect(coords).toEqual(expected)
  })
})
