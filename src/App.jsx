import { useState } from 'react'
import Uploader from './components/Uploader'
import Configure from './components/Configure'
import Results from './components/Results'

export default function App() {
  const [step, setStep] = useState(0)
  const [csvFile, setCsvFile] = useState(null)
  const [headers, setHeaders] = useState([])
  const [results, setResults] = useState(null)

  const handleUpload = (file, parsedHeaders) => {
    setCsvFile(file)
    setHeaders(parsedHeaders)
    setStep(1)
  }

  const handleResults = (data) => {
    setResults(data)
    setStep(2)
  }

  const reset = () => {
    setStep(0); setCsvFile(null); setHeaders([]); setResults(null)
  }

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>ML Model Playground</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Upload a CSV, pick features, train a model, inspect results</p>

      <Steps current={step} />

      {step === 0 && <Uploader onUpload={handleUpload} />}
      {step === 1 && <Configure csvFile={csvFile} headers={headers} onResults={handleResults} />}
      {step === 2 && <Results data={results} onReset={reset} />}
    </div>
  )
}

function Steps({ current }) {
  const steps = ['Upload', 'Configure', 'Results & Predict']
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 12, fontWeight: 500,
            background: i <= current ? '#1a1a1a' : '#e5e5e5',
            color: i <= current ? '#fff' : '#888'
          }}>{i < current ? '✓' : i + 1}</div>
          <span style={{ marginLeft: 6, marginRight: 16, fontSize: 13, color: i === current ? '#1a1a1a' : '#999' }}>{s}</span>
          {i < steps.length - 1 && <div style={{ width: 32, height: 1, background: '#e5e5e5', marginRight: 16 }} />}
        </div>
      ))}
    </div>
  )
}