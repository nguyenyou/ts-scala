import { describe, it, expect } from 'vitest'
import { convertTsToScala } from './converter'

describe('convertTsToScala', () => {
  it('converts a simple interface', () => {
    const tsSrc = `interface Person {\n  name: string;\n  age: number;\n}`
    const scala = convertTsToScala(tsSrc)
    expect(scala).toContain('trait Person:')
    expect(scala).toContain('val name: String')
    expect(scala).toContain('val age: Int')
  })

  it('converts a type alias', () => {
    const tsSrc = `type Id = string;`
    const scala = convertTsToScala(tsSrc)
    expect(scala.trim()).toBe('type Id = String')
  })
}) 