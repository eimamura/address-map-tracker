import Link from 'next/link';

export default function Home() {
  return (
    <div className="container animate-fade-in" style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '4rem',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, #58a6ff 0%, #bc8cff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-2px'
      }}>
        Address Map Tracker
      </h1>
      <p style={{
        fontSize: '1.25rem',
        color: 'var(--text-secondary)',
        maxWidth: '600px',
        marginBottom: '3rem',
        lineHeight: '1.7'
      }}>
        A production-ready MVP for address management.
        Secure, scalable, and beautifully minimal.
      </p>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Link href="/login" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
          Login
        </Link>
        <Link href="/register" className="btn" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
          Register
        </Link>
      </div>
    </div>
  );
}
