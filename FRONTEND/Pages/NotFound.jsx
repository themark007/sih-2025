import react from 'react';

export default function NotFound() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8f9fa' }}>
            <h1 style={{ fontSize: '6rem', margin: 0, color: '#343a40' }}>404</h1>
            <p style={{ fontSize: '1.5rem', color: '#6c757d' }}>Page Not Found</p>
            <a href="/" style={{ marginTop: '20px', textDecoration: 'none', color: '#007bff' }}>Go to Home</a>
        </div>
    );
}