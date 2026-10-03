import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import IssueCard from '../components/IssueCard'
import { ASSIGNEES, CATEGORIES, STATUSES } from '../data/sampleIssues'
import './AdminDashboardPage.css'

function AdminDashboardPage({ onUpdateIssue }) {
    const [supabaseIssues, setSupabaseIssues] = useState([])

  useEffect(() => {
    async function loadIssues() {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load issues:', error)
        return
      }

      setSupabaseIssues(
        (data || []).map((issue) => ({
          ...issue,
          assignedTo: issue.assigned_to ?? 'Unassigned',
        })),
      )
    }

    loadIssues()
  }, [])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')

  const counts = useMemo(() => {
  return {
    total: supabaseIssues.length,
    pending: supabaseIssues.filter((issue) => issue.status === 'Pending').length,
    progress: supabaseIssues.filter((issue) => issue.status === 'In Progress').length,
    resolved: supabaseIssues.filter((issue) => issue.status === 'Resolved').length,
  }
}, [supabaseIssues])

  const filteredIssues = supabaseIssues.filter((issue) => {
    const text = `${issue.title} ${issue.location}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesCategory = category === 'All' || issue.category === category
    const matchesStatus = status === 'All' || issue.status === status
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Admin dashboard</h1>
          <p>Search, filter, assign, and resolve campus issues.</p>
        </div>
      </div>

      <section className="stats-grid">
        <div className="card stat-card">
          <span>Total</span>
          <strong>{counts.total}</strong>
        </div>
        <div className="card stat-card">
          <span>Pending</span>
          <strong>{counts.pending}</strong>
        </div>
        <div className="card stat-card">
          <span>In progress</span>
          <strong>{counts.progress}</strong>
        </div>
        <div className="card stat-card">
          <span>Resolved</span>
          <strong>{counts.resolved}</strong>
        </div>
      </section>

      <section className="card filters">
        <div className="field">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or location"
          />
        </div>
        <div className="field">
          <label htmlFor="categoryFilter">Category</label>
          <select
            id="categoryFilter"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="All">All</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="statusFilter">Status</label>
          <select
            id="statusFilter"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="All">All</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="reports-list">
        {filteredIssues.length === 0 ? (
          <div className="card empty-state">
            <p>No issues match these filters.</p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue}>
              <div className="issue-actions">
                <select
                  value={issue.assignedTo}
                  onChange={async (event) => {
                    const assignedTo = event.target.value
                    if (await onUpdateIssue(issue.id, { assignedTo })) {
                      setSupabaseIssues((current) =>
                        current.map((item) =>
                          item.id === issue.id ? { ...item, assignedTo } : item,
                        ),
                      )
                    }
                  }}
                  aria-label={`Assign ${issue.title}`}
                >
                  {ASSIGNEES.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>

                <select
                  value={issue.status}
                  onChange={async (event) => {
                    const nextStatus = event.target.value
                    if (await onUpdateIssue(issue.id, { status: nextStatus })) {
                      setSupabaseIssues((current) =>
                        current.map((item) =>
                          item.id === issue.id ? { ...item, status: nextStatus } : item,
                        ),
                      )
                    }
                  }}
                  aria-label={`Update status for ${issue.title}`}
                >
                  {STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                {issue.status !== 'Resolved' && (
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={async () => {
                      if (await onUpdateIssue(issue.id, { status: 'Resolved' })) {
                        setSupabaseIssues((current) =>
                          current.map((item) =>
                            item.id === issue.id ? { ...item, status: 'Resolved' } : item,
                          ),
                        )
                      }
                    }}
                  >
                    Mark resolved
                  </button>
                )}
              </div>
            </IssueCard>
          ))
        )}
      </section>
    </main>
  )
}

export default AdminDashboardPage
