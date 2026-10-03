import './Navbar.css'

function Navbar({ role, currentPage, onNavigate, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="navbar-mark">SC</span>
          <div>
            <strong>Smart Campus</strong>
            <p>{role === 'admin' ? 'Admin portal' : 'Student portal'}</p>
          </div>
        </div>

        <nav className="navbar-links">
          {role === 'student' && (
            <>
              <button
                type="button"
                className={currentPage === 'myReports' ? 'active' : ''}
                onClick={() => onNavigate('myReports')}
              >
                My reports
              </button>
              <button
                type="button"
                className={currentPage === 'reportIssue' ? 'active' : ''}
                onClick={() => onNavigate('reportIssue')}
              >
                Report issue
              </button>
            </>
          )}

          {role === 'admin' && (
            <button
              type="button"
              className={currentPage === 'adminDashboard' ? 'active' : ''}
              onClick={() => onNavigate('adminDashboard')}
            >
              Dashboard
            </button>
          )}

          <button type="button" className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
