import { describe, it, expect, beforeEach } from 'vitest'
import { Model, parseVisitorId } from './model'

describe('QueueManager model', () => {
  let m: Model
  beforeEach(() => {
    m = new Model()
  })

  describe('AddVisitor', () => {
    it('assigns incrementing IDs, records reason and time, appends to the end', () => {
      const t = new Date(2026, 10, 9, 9, 5)
      const a = m.addVisitor('License renewal', t)
      const b = m.addVisitor('Registration')
      expect(a.id).toBe(1)
      expect(b.id).toBe(2)
      expect(a.reason).toBe('License renewal')
      expect(a.arrivedText).toBe('09:05')
      expect(m.visitors.map((v) => v.id)).toEqual([1, 2])
    })

    it('rejects an empty reason', () => {
      expect(() => m.addVisitor('   ')).toThrow()
      expect(m.visitors).toHaveLength(0)
    })

    it('never reuses an ID after a Visitor is assigned', () => {
      m.addClerk('Hugh')
      m.addVisitor('a')
      m.assignVisitor(1, 'Hugh')
      expect(m.addVisitor('b').id).toBe(2)
    })
  })

  describe('AddClerk / RemoveClerk', () => {
    it('adds a Clerk with a helped count of 0', () => {
      const c = m.addClerk('Jess')
      expect(c.helped).toBe(0)
      expect(c.isAvailable).toBe(true)
    })

    it('requires unique, non-empty names', () => {
      m.addClerk('Jess')
      expect(() => m.addClerk('jess')).toThrow()
      expect(() => m.addClerk('  ')).toThrow()
    })

    it('removes a Clerk', () => {
      m.addClerk('Jess')
      m.removeClerk('Jess')
      expect(m.clerks).toHaveLength(0)
    })

    it('cannot remove when there are no Clerks or the name is unknown', () => {
      expect(() => m.removeClerk('Jess')).toThrow()
      m.addClerk('Hugh')
      expect(() => m.removeClerk('Jess')).toThrow()
    })
  })

  describe('AssignVisitor', () => {
    beforeEach(() => {
      m.addClerk('Hugh')
      m.addVisitor('one')
      m.addVisitor('two')
    })

    it('removes the Visitor from the waitlist and gives them to the Clerk', () => {
      m.assignVisitor(2, 'Hugh')
      expect(m.visitors.map((v) => v.id)).toEqual([1])
      expect(m.findClerk('Hugh')!.current!.id).toBe(2)
    })

    it('rejects an unknown Visitor or Clerk', () => {
      expect(() => m.assignVisitor(9, 'Hugh')).toThrow()
      expect(() => m.assignVisitor(1, 'Nobody')).toThrow()
      expect(m.visitors).toHaveLength(2)
    })

    it('rejects a busy Clerk', () => {
      m.assignVisitor(1, 'Hugh')
      expect(() => m.assignVisitor(2, 'Hugh')).toThrow()
      expect(m.visitors.map((v) => v.id)).toEqual([2])
    })

    it('needs a waiting Visitor and an available Clerk', () => {
      expect(() => new Model().assignVisitor(1, 'x')).toThrow()
      const empty = new Model()
      empty.addVisitor('x')
      expect(() => empty.assignVisitor(1, 'x')).toThrow()
    })
  })

  describe('ClearClerk', () => {
    it('frees the Clerk and increments their helped count', () => {
      m.addClerk('Hugh')
      m.addVisitor('one')
      m.assignVisitor(1, 'Hugh')
      m.clearClerk('Hugh')
      const c = m.findClerk('Hugh')!
      expect(c.isAvailable).toBe(true)
      expect(c.helped).toBe(1)
    })

    it('rejects a Clerk who is not helping anyone', () => {
      m.addClerk('Hugh')
      expect(() => m.clearClerk('Hugh')).toThrow()
      expect(m.findClerk('Hugh')!.helped).toBe(0)
    })
  })

  describe('parseVisitorId', () => {
    it('accepts 3 and #3', () => {
      expect(parseVisitorId('3')).toBe(3)
      expect(parseVisitorId(' #3 ')).toBe(3)
    })
    it('rejects junk', () => {
      for (const bad of ['', 'abc', '0', '-1', '2.5']) {
        expect(() => parseVisitorId(bad)).toThrow()
      }
    })
  })
})
