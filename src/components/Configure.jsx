import { useState } from 'react'
import axios from 'axios'

const card = { background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }
const label = { fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '1rem' }

export default function Configure({ csvFile, headers, onResults }) {
  const [target, setTarget] = useState(headers[headers.length - 1])
  const [features, setFeatures] = useState(headers.slice(0, -1))
  const [modelType, setModelType] = useState('lr')
  const [training, setTraining] = useState(false)
  const [err, setErr] = useState('')

  const toggleFeat = (col) => {
    if (col === target) return
    setFeatures(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])
  }

  const setTargetCol = (col) => {
    setTarget(col)
    setFeatures(prev => prev.filter(c => c !== col))
  }

  const train = async () => {
    if (features.length === 0) { setErr('Select at least one feature column'); return }
    setTraining(true); setErr('')
    try {
      const formData = new FormData()
      formData.append('file', csvFile)
      formData.append('target', target)
      formData.append('features', JSON.stringify(features))
      formData.append('model_type', modelType)
      const { data } = await axios.post('https://ml-playground-production.up.railway.app/', formData)
      onResults(data)
    } catch (e) {
      setErr(e.response?.data?.detail || 'Training failed. Make sure all selected columns are numeric.')
    }
    setTraining(false)
  }

  return (
    <div>
      <div style={card}>
        <p style={label}>Assign columns</p>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Click a column to make it the target. All others become features.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {headers.map(h => (
            <span key={h} onClick={() => h === target ? null : features.includes(h) ? toggleFeat(h) : setTargetCol(h)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', userSelect: 'none',
                background: h === target ? '#d4edda' : features.includes(h) ? '#d1e7ff' : '#f0f0f0',
                color: h === target ? '#155724' : features.includes(h) ? '#0a58ca' : '#555',
                border: `1px solid ${h === target ? '#a8d5b5' : features.includes(h) ? '#9ec5fe' : '#ddd'}`
              }}>
              {h} {h === target ? '(target)' : ''}
            </span>
          ))}
        </div>
      </div>

      <div style={card}>
        <p style={label}>Choose model</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { id: 'lr', name: 'Logistic Regression', desc: 'Fast · Interpretable weights · Great baseline' },
            { id: 'rf', name: 'Random Forest', desc: '100 trees · Handles nonlinearity · Real feature importance' }
          ].map(m => (
            <div key={m.id} onClick={() => setModelType(m.id)} style={{
              border: `${modelType === m.id ? '2px solid #1a1a1a' : '1px solid #e5e5e5'}`,
              borderRadius: 8, padding: '1rem', cursor: 'pointer',
              background: modelType === m.id ? '#f9f9f9' : '#fff'
            }}>
              <p style={{ fontWeight: 500, marginBottom: 4 }}>{m.name}</p>
              <p style={{ fontSize: 12, color: '#888' }}>{m.desc}</p>
            </div>
          ))}
        </div>
        {err && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{err}</p>}
        {training && <div style={{ height: 3, background: '#e5e5e5', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: '100%', background: '#1a1a1a', animation: 'progress 1.5s ease-in-out', borderRadius: 2 }} />
          <style>{`@keyframes progress { from{width:0} to{width:100%} }`}</style>
        </div>}
        <button onClick={train} disabled={training || features.length === 0} style={{
          width: '100%', padding: '10px', background: '#1a1a1a', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500,
          cursor: training ? 'not-allowed' : 'pointer', opacity: training ? .5 : 1
        }}>{training ? 'Training…' : 'Train model →'}</button>
      </div>
    </div>
  )
}