'use client';
import { useState } from 'react';

export default function Page() {
  const [script, setScript] = useState('');
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleSplit() {
    setError('');
    setScenes([]);
    if (!script.trim()) { setError('Please paste a script first.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Server error');
      }
      const data = await res.json();
      setScenes(data.scenes || []);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setScript('');
    setScenes([]);
    setError('');
  }

  function handleCopy() {
    const all = scenes.map((s,i)=>`Scene ${i+1}\n${s}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(all).then(()=>{
      setCopied(true);
      setTimeout(()=>setCopied(false),2000);
    });
  }

  return (
    <div className="container">
      <header style={{alignItems:'flex-start'}}>
        <div>
          <h1>AI Script Splitter</h1>
          <div className="muted">Paste your script and let AI split it into scenes.</div>
        </div>
        <div className="top-actions">
          <button className="copy-btn" onClick={handleCopy} disabled={scenes.length===0}>{copied? 'Copied' : 'Copy All'}</button>
          <a href="https://vercel.com" target="_blank" rel="noreferrer" className="muted">Powered by Vercel</a>
        </div>
      </header>

      <section className="card">
        <label className="muted">Script</label>
        <textarea value={script} onChange={e=>setScript(e.target.value)} placeholder="Paste a long script here..." />
        <div className="controls">
          <button onClick={handleSplit} disabled={loading}>{loading? 'Splitting...' : 'Split Script'}</button>
          <button className="secondary" onClick={handleClear}>Clear</button>
          <div style={{marginLeft:'auto'}} className="muted">Tip: For better results, include scene headings (INT./EXT., location lines)</div>
        </div>
        {error && <div style={{color:'#b91c1c',marginTop:10}}>{error}</div>}
      </section>

      <section className="scenes">
        {scenes.length===0 && <div className="muted" style={{marginTop:12}}>No scenes yet. Click <strong>Split Script</strong> to begin.</div>}
        {scenes.map((s,i)=> (
          <div key={i} className="scene">
            <h3>Scene {i+1}</h3>
            <pre>{s}</pre>
          </div>
        ))}
      </section>

      <footer className="muted">Keep your OpenAI API key secret. This demo calls OpenAI to split scripts.</footer>
    </div>
  );
}
