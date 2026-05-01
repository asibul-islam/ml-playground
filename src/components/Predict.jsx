import { useState, useRef } from 'react'
import axios from 'axios'

const card = { background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }

export default function Predict() {
  const [rows, setRows] = useState(null)
  const [featCols, setFeatCols] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [over, setOver] = useState(false)
  const ref = useRef()

  const handle = async (file) => {
    if (!file || !file.name.endsWith('.csv')) { setErr('Please upload a .csv file'); return }
    setLoading(true); setErr('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await axios.post('http://localhost:8000/predict', formData)
      if (data.error) { setErr(data.error); setLoading(false); return }
      setRows(data.predictions)
      setFeatCols(data.feat_cols)
    } catch (e) {
      setErr('Prediction failed. Make sure the CSV has the same columns as your training data.')
    }
    setLoading(false)
  }

  const downloadCSV = () => {
    const headers = [...featCols, 'prediction', 'confidence_%']
    const lines = rows.map(r => [...featCols.map(c => r[c]), r.prediction, r.confidence].join(','))
    const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = 'predictions.csv'; a.click()
  }

  return (
    <div>
      <div style={card}>
        <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Predict on new data</p>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>Upload a CSV with the same feature columns — no target column needed.</p>
        {err && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{err}</p>}
        <div
          onClick={() => ref.current.click()}
          onDragOver={e => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={e => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files[0]) }}
          style={{
            border: `2px dashed ${over ? '#888' : '#d5d5d5'}`, borderRadius: 8,
            padding: '2rem', textAlign: 'center', cursor: 'pointer',
            background: over ? '#f5f5f5' : 'transparent', transition: 'all .15s'
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>📂</div>
          <p style={{ fontWeight: 500, marginBottom: 4 }}>Drop new CSV here</p>
          <p style={{ color: '#888', fontSize: 13 }}>Must have the same feature columns as your training data</p>
          <input ref={ref} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handle(e.target.files[0])} />
        </div>
        {loading && <div style={{ height: 3, background: '#e5e5e5', borderRadius: 2, overflow: 'hidden', marginTop: 16 }}>
          <div style={{ height: '100%', background: '#1a1a1a', animation: 'progress 1.2s ease-in-out', borderRadius: 2 }} />
          <style>{`@keyframes progress { from{width:0} to{width:100%} }`}</style>
        </div>}
      </div>

      {rows && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {rows.length} predictions
            </p>
            <button onClick={downloadCSV} style={{
              padding: '5px 14px', background: '#1a1a1a', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12
            }}>Download CSV ↓</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={th}>#</th>
                  {featCols.map(c => <th key={c} style={th}>{c}</th>)}
                  <th style={th}>Prediction</th>
                  <th style={th}>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 100).map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={td}>{i + 1}</td>
                    {featCols.map(c => <td key={c} style={td}>{r[c]}</td>)}
                    <td style={{ ...td, fontWeight: 500, color: r.prediction === 1 ? '#155724' : '#c0392b' }}>
                      {r.prediction === 1 ? '1 (above)' : '0 (below)'}
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#e5e5e5', borderRadius: 3 }}>
                          <div style={{ width: `${r.confidence}%`, height: '100%', background: '#1a1a1a', borderRadius: 3 }} />
                        </div>
                        <span style={{ minWidth: 36, fontSize: 12 }}>{r.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 100 && <p style={{ fontSize: 12, color: '#888', marginTop: 8, textAlign: 'center' }}>Showing 100 of {rows.length} rows — download CSV for all</p>}
          </div>
        </div>
      )}
    </div>
  )
}

const th = { padding: '8px 12px', border: '1px solid #e5e5e5', background: '#f9f9f9', fontSize: 12, fontWeight: 500, color: '#666', textAlign: 'left', whiteSpace: 'nowrap' }
const td = { padding: '7px 12px', border: '1px solid #e5e5e5', textAlign: 'left', whiteSpace: 'nowrap' }