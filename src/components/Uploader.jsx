import { useRef, useState } from 'react'

const card = { background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }

export default function Uploader({ onUpload }) {
  const [over, setOver] = useState(false)
  const [err, setErr] = useState('')
  const ref = useRef()

  const handle = (file) => {
    if (!file || !file.name.endsWith('.csv')) { setErr('Please upload a .csv file'); return }
    const reader = new FileReader()
    reader.onload = (e) => {
      const lines = e.target.result.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      if (headers.length < 2) { setErr('CSV must have at least 2 columns'); return }
      setErr('')
      onUpload(file, headers)
    }
    reader.readAsText(file)
  }

  return (
    <div style={card}>
      <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '1rem' }}>Upload dataset</p>
      {err && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{err}</p>}
      <div
        onClick={() => ref.current.click()}
        onDragOver={e => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={e => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files[0]) }}
        style={{
          border: `2px dashed ${over ? '#888' : '#d5d5d5'}`, borderRadius: 8,
          padding: '2.5rem', textAlign: 'center', cursor: 'pointer',
          background: over ? '#f5f5f5' : 'transparent', transition: 'all .15s'
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
        <p style={{ fontWeight: 500, marginBottom: 4 }}>Drop a CSV file here</p>
        <p style={{ color: '#888', fontSize: 13 }}>or click to browse</p>
        <input ref={ref} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handle(e.target.files[0])} />
      </div>
    </div>
  )
}