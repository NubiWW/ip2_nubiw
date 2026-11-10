export class Visitor {
  constructor(
    public readonly id: number,
    public readonly reason: string,
    public readonly arrived: Date,
  ) {}

  /**arrival time is as HH:MM (24 hour) its just easier than AM or PM */
  get arrivedText(): string {
    const hh = String(this.arrived.getHours()).padStart(2, '0')
    const mm = String(this.arrived.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  }
}

export class Clerk {
  helped = 0 
  /** this is the Visitor currently being helped (or null if the Clerk is helpin nobody) */
  current: Visitor | null = null

  constructor(public readonly name: string) {}

  get isAvailable(): boolean {
    return this.current === null
  }
}

/** id checker*/
export function parseVisitorId(text: string): number {
  const cleaned = text.trim().replace(/^#/, '')
  const id = Number(cleaned)
  if (cleaned === '' || !Number.isInteger(id) || id < 1) {
    throw new Error('Enter the Visitor ID as a whole number, such as 3.')
  }
  return id
}

export class Model {
  visitors: Visitor[] = []
  clerks: Clerk[] = []
  private nextId = 1

  findClerk(name: string): Clerk | undefined {
    const wanted = name.trim().toLowerCase()
    return this.clerks.find((c) => c.name.toLowerCase() === wanted)
  }

  /** AddVisitor checker*/
  addVisitor(reason: string, now: Date = new Date()): Visitor {
    const trimmed = reason.trim()
    if (trimmed === '') throw new Error('Enter a reason for the visit.')
    const visitor = new Visitor(this.nextId++, trimmed, now)
    this.visitors.push(visitor)
    return visitor
  }

  /** AddClerk checker*/
  addClerk(name: string): Clerk {
    const trimmed = name.trim()
    if (trimmed === '') throw new Error('Enter a name for the Clerk.')
    if (this.findClerk(trimmed)) {
      throw new Error(`A Clerk named "${trimmed}" already exists.`)
    }
    const clerk = new Clerk(trimmed)
    this.clerks.push(clerk)
    return clerk
  }

  /**RemoveClerk checker*/
removeClerk(name: string): void {
  if (this.clerks.length === 0) throw new Error('There are no Clerks to remove.')
  const clerk = this.findClerk(name)
  if (!clerk) throw new Error(`There is no Clerk named "${name.trim()}".`)
  if (!clerk.isAvailable) {
    throw new Error(
      `${clerk.name} is helping Visitor #${clerk.current!.id} and cannot be removed. Clear them first.`,
    )
  }
  this.clerks = this.clerks.filter((c) => c !== clerk)
}

  /** AssignVisitor checker*/
  assignVisitor(visitorId: number, clerkName: string): void {
    if (this.visitors.length === 0) throw new Error('No Visitors are waiting.')
    if (!this.clerks.some((c) => c.isAvailable)) {
      throw new Error('No Clerk is available right now.')
    }
    const visitor = this.visitors.find((v) => v.id === visitorId)
    if (!visitor) throw new Error(`Visitor #${visitorId} is not on the waitlist.`)
    const clerk = this.findClerk(clerkName)
    if (!clerk) throw new Error(`There is no Clerk named "${clerkName.trim()}".`)
    if (!clerk.isAvailable) {
      throw new Error(`${clerk.name} is already helping Visitor #${clerk.current!.id}.`)
    }
    this.visitors = this.visitors.filter((v) => v !== visitor)
    clerk.current = visitor
  }

  /** ClearClerk checker*/
  clearClerk(name: string): void {
    const clerk = this.findClerk(name)
    if (!clerk) throw new Error(`There is no Clerk named "${name.trim()}".`)
    if (clerk.isAvailable) throw new Error(`${clerk.name} is not helping a Visitor.`)
    clerk.current = null
    clerk.helped += 1
  }
}
