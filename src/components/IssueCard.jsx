import StatusBadge from './StatusBadge'
import './IssueCard.css'

function IssueCard({ issue, children }) {
  return (
    <article className="issue-card card">
      {issue.photoUrl ? (
        <img className="issue-photo" src={issue.photoUrl} alt="" />
      ) : (
        <div className="issue-photo placeholder">No photo</div>
      )}

      <div className="issue-body">
        <div className="issue-top">
          <h3>{issue.title}</h3>
          <StatusBadge status={issue.status} />
        </div>
        <p className="issue-meta">
          {issue.category} · {issue.location}
          {issue.priority ? ` · Priority: ${issue.priority}` : ''}
        </p>
        <p className="issue-desc">{issue.description}</p>
        <p className="issue-foot">
          Assigned to {issue.assignedTo} · Reported {issue.createdAt}
        </p>
        {children}
      </div>
    </article>
  )
}

export default IssueCard
