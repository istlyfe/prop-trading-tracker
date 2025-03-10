// Static page with no imports
function Custom404() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1rem',
      padding: '3rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>404</h1>
      <h2 style={{ fontSize: '1.25rem' }}>Page not found</h2>
      <p style={{ maxWidth: '30rem', marginBottom: '1rem' }}>
        Sorry, we couldn't find the page you're looking for.
      </p>
      <a 
        href="/dashboard" 
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#000',
          color: '#fff',
          borderRadius: '0.375rem',
          textDecoration: 'none'
        }}
      >
        Go back to dashboard
      </a>
    </div>
  )
}

export default Custom404 