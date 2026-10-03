import './StatusBadge.css'

function StatusBadge({ status }) {
  const className =
    status === 'Resolved'
      ? 'badge resolved'
      : status === 'In Progress'
        ? 'badge progress'
        : 'badge pending'

  return <span className={className}>{status}</span>
}

export default StatusBadge
