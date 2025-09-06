import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'




function App() {
  const [count, setCount] = useState(0)
  const [inputText, setInputText] = useState('')
  const [chunks, setChunks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [summaries, setSummaries] = useState({}) // {chunkIdx: summary}
  const [summarizingIdx, setSummarizingIdx] = useState(null)
  const [downloading, setDownloading] = useState(false)

  const handleChunk = async () => {
    setLoading(true)
    setError('')
    setSummaries({})
    try {
      const response = await fetch('http://127.0.0.1:8000/chunk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          max_chars: 1200,
          overlap: 200
        })
      })
      if (!response.ok) throw new Error('Failed to chunk text')
      const data = await response.json()
      setChunks(data.chunks)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  const handleDownload = () => {
    setDownloading(true)
    // Build markdown content
    let md = '# Summaries\n\n'
    chunks.forEach((chunk, idx) => {
      md += `## Chunk ${idx + 1}\n`;
      md += chunk + '\n\n';
      if (summaries[idx]) {
        md += `**Summary:**\n${summaries[idx]}\n\n`;
      }
    });
    // Create blob and download
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summaries.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(false), 1000);
  }

  const handleSummarize = async (chunk, idx) => {
    setSummarizingIdx(idx)
    try {
      const response = await fetch('http://127.0.0.1:8000/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: chunk,
          min_length: 30,
          max_length: 120
        })
      })
      if (!response.ok) throw new Error('Failed to summarize chunk')
      const data = await response.json()
      setSummaries(prev => ({ ...prev, [idx]: data.summary }))
    } catch (err) {
      setSummaries(prev => ({ ...prev, [idx]: 'Error: ' + err.message }))
    } finally {
      setSummarizingIdx(null)
    }
  }

  return (
    <div className="main-layout">
      <header className="top-bar">
        <span className="app-title">Researcher's Heaven</span>
      </header>
      <main className="content">
        <section className="project-desc">
          <h2>Welcome!</h2>
          <p>
            Bring your lengthy paper and save your time. This app helps researchers summarize and understand papers faster, with a clean, minimal, and colorful interface.
          </p>
          <p className="hobby-note">Made as a hobby project for the research community.</p>
        </section>
        <section className="input-section">
          <h3>Paste your paper or text</h3>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={10}
            cols={60}
            placeholder="Paste your text here..."
            style={{ fontFamily: 'inherit', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}
          />
          <br />
          <button onClick={handleChunk} disabled={loading || !inputText} style={{ margin: '8px 0', padding: '8px 16px', borderRadius: '6px', background: '#4f8cff', color: '#fff', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? (
              <span>
                <span className="spinner" style={{ marginRight: '8px' }}></span>Chunking...
              </span>
            ) : 'Chunk Text'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </section>
        <section className="summary-box">
          <h3>Chunks</h3>
          <div className="summary-content">
            {chunks.length === 0 ? (
              <p className="summary-placeholder">No chunks yet. Paste text and click 'Chunk Text'.</p>
            ) : (
              <>
                <button onClick={handleDownload} disabled={downloading || Object.keys(summaries).length === 0} style={{ marginBottom: '16px', padding: '8px 16px', borderRadius: '6px', background: '#2ecc40', color: '#fff', border: 'none', fontWeight: 'bold', cursor: downloading ? 'not-allowed' : 'pointer' }}>
                  {downloading ? 'Downloading...' : 'Download Summaries (Markdown)'}
                </button>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {chunks.map((chunk, idx) => (
                    <li key={idx}>
                      <div className="chunk-card" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '16px', background: '#fff', border: '1px solid #eee' }}>
                        <strong style={{ color: '#4f8cff' }}>Chunk {idx + 1}:</strong>
                        <p style={{ margin: '8px 0', fontSize: '1rem' }}>{chunk}</p>
                        <button
                          onClick={() => handleSummarize(chunk, idx)}
                          disabled={summarizingIdx === idx}
                          style={{ padding: '6px 12px', borderRadius: '6px', background: '#ffb347', color: '#222', border: 'none', fontWeight: 'bold', cursor: summarizingIdx === idx ? 'not-allowed' : 'pointer', marginBottom: '8px' }}
                        >
                          {summarizingIdx === idx ? (
                            <span>
                              <span className="spinner" style={{ marginRight: '8px' }}></span>Summarizing...
                            </span>
                          ) : 'Summarize'}
                        </button>
                        {summaries[idx] && (
                          <div className="chunk-summary" style={{ background: '#f6f8fa', borderRadius: '8px', padding: '10px', marginTop: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                            <strong style={{ color: '#2ecc40' }}>Summary:</strong>
                            <p style={{ margin: '6px 0', fontSize: '0.98rem' }}>{summaries[idx]}</p>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
        <section className="demo-section">
          <button onClick={() => setCount((count) => count + 1)}>
            Demo button (count is {count})
          </button>
        </section>
      </main>
    </div>
  )
}

export default App
