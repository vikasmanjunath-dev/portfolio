export default function NotFound() {
  return (
    <main id="main" className="wrap" style={{ minHeight: '80vh', display: 'grid', alignContent: 'center', gap: 20, paddingTop: 120 }}>
      <p className="mono">404 · declined</p>
      <h1 className="big">This page failed verification.</h1>
      <p className="lead">Like my products, this site would rather say “I don’t have that” than guess.</p>
      <p><a className="pill" href="/">Back home</a></p>
    </main>
  );
}
