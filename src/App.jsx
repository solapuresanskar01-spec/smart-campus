import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import MyReportsPage from './pages/MyReportsPage'
import ReportIssuePage from './pages/ReportIssuePage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import { supabase } from './lib/supabase'

async function getAuthenticatedProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) {
    throw userError
  }
  if (!userData.user) {
    throw new Error('No authenticated user was found.')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profile')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (profileError) {
    throw profileError
  }
  if (!['student', 'admin'].includes(profile.role)) {
    throw new Error('Your profile does not have a valid Student or Admin role.')
  }

  return { user: userData.user, role: profile.role }
}

function App() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [currentPage, setCurrentPage] = useState('login')
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let isActive = true
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && isActive) {
        setUser(null)
        setRole(null)
        setCurrentPage('login')
      }
    })

    async function restoreSession() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          throw error
        }
        if (data.session) {
          const authenticated = await getAuthenticatedProfile()
          if (isActive) {
            setUser(authenticated.user)
            setRole(authenticated.role)
            setCurrentPage(
              authenticated.role === 'admin' ? 'adminDashboard' : 'myReports',
            )
          }
        }
      } catch (error) {
        console.error('Failed to restore authentication session:', error)
        if (isActive) {
          setAuthError('Unable to load your account. Please log in again.')
        }
      } finally {
        if (isActive) {
          setAuthLoading(false)
        }
      }
    }

    restoreSession()
    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleAuthenticated() {
    setAuthError('')
    const authenticated = await getAuthenticatedProfile()
    setUser(authenticated.user)
    setRole(authenticated.role)
    setCurrentPage(authenticated.role === 'admin' ? 'adminDashboard' : 'myReports')
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Failed to log out:', error)
      setAuthError('Unable to log out. Please try again.')
    }
  }

  function handleSubmitIssue() {
    setCurrentPage('myReports')
  }

  async function handleUpdateIssue(id, updates) {
    const supabaseUpdates = {}

    if (updates.status !== undefined) {
      supabaseUpdates.status = updates.status
    }
    if (updates.assignedTo !== undefined) {
      supabaseUpdates.assigned_to = updates.assignedTo
    }

    const { error } = await supabase
      .from('issues')
      .update(supabaseUpdates)
      .eq('id', id)

    if (error) {
      console.error('Failed to update issue:', error)
      return false
    }

    return true
  }

  if (authLoading) {
    return (
      <main className="login-page">
        <p>Loading your account...</p>
      </main>
    )
  }

  if (!user || !role) {
    return <LoginPage onAuthenticated={handleAuthenticated} initialError={authError} />
  }

  return (
    <>
      <Navbar
        role={role}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />

      {role === 'student' && currentPage === 'myReports' && (
        <MyReportsPage
          userId={user.id}
          onReportNew={() => setCurrentPage('reportIssue')}
        />
      )}

      {role === 'student' && currentPage === 'reportIssue' && (
        <ReportIssuePage user={user} onSubmit={handleSubmitIssue} />
      )}

      {role === 'admin' && (
        <AdminDashboardPage onUpdateIssue={handleUpdateIssue} />
      )}
    </>
  )
}

export default App
