'use client'
import React from 'react'
import { Model, parseVisitorId } from './model'
import './queuemanager.css'

export default function Home() {
  const [model, setModel] = React.useState(new Model())
  const [redraw, setRedraw] = React.useState(0)

  //is the "reason for visit" prompt open and what error (if any) to show
  const [adding, setAdding] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const box = (id: string) => document.getElementById(id) as HTMLInputElement

  const attempt = (action: () => void) => { //runs controller action
    try {
      action()
      setMessage('')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e)) //error msg
    }
    setRedraw(redraw + 1) // ... and refresh display....
  }

  //CONTROLLER
  const addVisitor = () =>
    attempt(() => {
      const reason = box('reason')
      model.addVisitor(reason.value)
      reason.value = ''
      setAdding(false)
    })

  const addClerk = () =>
    attempt(() => {
      const name = box('clerk-name')
      model.addClerk(name.value)
      name.value = ''
    })

  const removeClerk = (name: string) => attempt(() => model.removeClerk(name))

  const assignVisitor = () =>
    attempt(() => {
      const id = box('assign-id')
      const clerk = box('assign-clerk')
      model.assignVisitor(parseVisitorId(id.value), clerk.value)
      id.value = ''
      clerk.value = ''
    })

  const clearClerk = (name: string) => attempt(() => model.clearClerk(name))

  const count = model.visitors.length

  // BOUNDARY object
  return (
    <main className="qm-page">
      <div className="qm-window">
        <div className="qm-body">
          {/* Waitlist */}
          <section aria-labelledby="waitlist-title">
            <div className="qm-head">
              <h1 id="waitlist-title">
                Waitlist: {count} {count === 1 ? 'Visitor' : 'Visitors'}
              </h1>
              <button className="btn btn-green" onClick={() => setAdding(true)}>
                +Add Visitor
              </button>
            </div>

            <div className="qm-waitlist" tabIndex={0} aria-label="Visitors waiting">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Reason for visit</th>
                    <th>Arrived</th>
                  </tr>
                </thead>
                <tbody>
                  {model.visitors.map((v) => (
                    <tr key={v.id}>
                      <td>#{v.id}</td>
                      <td>{v.reason}</td>
                      <td>{v.arrivedText}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {count === 0 && <p className="qm-empty">No Visitors are waiting.</p>}
            </div>
          </section>

          {/* Clerks */}
          <section className="qm-clerks-col" aria-label="Clerks">
            <div className="qm-clerks">
              <div className="qm-clerk-row qm-clerk-head">
                <span>Name</span>
                <span />
                <span />
                <span className="qm-helped">Visitors Helped</span>
              </div>
              <div className="qm-clerk-scroll">
                {model.clerks.map((c) => (
                  <div className="qm-clerk-row" key={c.name}>
                    <span className="qm-clerk-name">
                      {c.name}
                      {c.current && (
                        <span className="qm-with" aria-label={`With Visitor #${c.current.id}`}>
                          <span className="qm-dot" />#{c.current.id}
                        </span>
                      )}
                    </span>
                    <span>
                      {c.current && (
                        <button
                          className="btn btn-cyan btn-small"
                          onClick={() => clearClerk(c.name)}
                          aria-label={`Clear ${c.name}`}
                        >
                          Clear
                        </button>
                      )}
                    </span>
                    <span>
                      <button
                        className="btn-x"
                        onClick={() => removeClerk(c.name)}
                        aria-label={`Remove ${c.name}`}
                      >
                        &times;
                      </button>
                    </span>
                    <span className="qm-helped">{c.helped}</span>
                  </div>
                ))}
                {model.clerks.length === 0 && <p className="qm-empty">No Clerks yet.</p>}
              </div>
            </div>

            <form
              className="qm-add-clerk"
              onSubmit={(e) => {
                e.preventDefault()
                addClerk()
              }}
            >
              <input id="clerk-name" type="text" placeholder="Insert Name Here" aria-label="New Clerk name" />
              <button className="btn btn-green" type="submit">
                +Clerk
              </button>
            </form>
          </section>
        </div>

        {/* Assign bar */}
        <form
          className="qm-assign"
          onSubmit={(e) => {
            e.preventDefault()
            assignVisitor()
          }}
        >
          <span className="qm-assign-title">Assign To Clerk</span>
          <input
            id="assign-id"
            className="qm-id-input"
            type="text"
            placeholder="Insert ID"
            aria-label="Visitor ID"
          />
          <input
            id="assign-clerk"
            className="qm-find"
            type="text"
            list="available-clerks"
            placeholder="Find Clerks"
            aria-label="Clerk name"
          />
          <datalist id="available-clerks">
            {model.clerks
              .filter((c) => c.isAvailable)
              .map((c) => (
                <option key={c.name} value={c.name} />
              ))}
          </datalist>
          <button className="btn btn-cyan btn-big" type="submit">
            Assign
          </button>
        </form>

        <p className="qm-message" role="status">
          {!adding && message}
        </p>
      </div>

      {/* AddVisitor prompt*/}
      {adding && (
        <div className="qm-overlay" role="dialog" aria-modal="true" aria-label="Add Visitor">
          <form
            className="qm-dialog"
            onSubmit={(e) => {
              e.preventDefault()
              addVisitor()
            }}
          >
            <label htmlFor="reason">Reason for visit</label>
            <input id="reason" type="text" autoFocus />
            <p className="qm-message" role="status">
              {message}
            </p>
            <div className="qm-dialog-actions">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setAdding(false)
                  setMessage('')
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-green">
                Add Visitor
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}