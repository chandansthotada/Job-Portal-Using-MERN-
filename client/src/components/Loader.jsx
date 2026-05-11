const Loader = ({ text = 'Loading...' }) => (
  <div style={styles.wrap}>
    <div style={styles.spinner} />
    <p style={styles.text}>{text}</p>
  </div>
);

const styles = {
  wrap:    { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 14 },
  spinner: { width: 44, height: 44, border: '4px solid #e5e7eb', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  text:    { color: '#6b7280', fontSize: '0.95rem' },
};

export default Loader;