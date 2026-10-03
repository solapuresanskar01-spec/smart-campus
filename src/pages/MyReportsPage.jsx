import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import IssueCard from '../components/IssueCard'
import './MyReportsPage.css'

function MyReportsPage({ userId, onReportNew }) {
  const [issues, setIssues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadIssues() {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('reported_by', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load reports:', error)
        if (isActive) {
          setLoadError('Unable to load reports right now.')
          setIsLoading(false)
        }
        return
      }

      if (isActive) {
        setIssues(
          (data || []).map((issue) => ({
            ...issue,
            photoUrl: issue.photo_url || '',
            assignedTo: issue.assigned_to || 'Unassigned',
            createdAt: issue.created_at ? issue.created_at.slice(0, 10) : '',
          })),
        )
        setIsLoading(false)
      }
    }

    loadIssues()

    return () => {
      isActive = false
    }
  }, [userId])

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>My reports</h1>
          <p>Track campus issues that have been submitted.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={onReportNew}>
          Report an issue
        </button>
      </div>

      {isLoading ? (
        <div className="card empty-state">
          <p>Loading reports...</p>
        </div>
      ) : loadError ? (
        <div className="card empty-state">
          <p>{loadError}</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="card empty-state">
          <p>No reports yet. Submit your first campus issue.</p>
        </div>
      ) : (
        <div className="reports-list">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </main>
  )
}

export default MyReportsPage
