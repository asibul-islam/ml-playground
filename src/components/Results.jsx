import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Predict from './Predict'

const card = { background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }
const label = { fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '1rem' }
const pct = v => `${(v * 100).toFixed(1)}%`

const downloadModel = async () => {
  const res = await fetch('http://localhost:8000/download-model')
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `ml_playground_model.pkl`
  a.click()
}

export default function Results({ data, onReset }) {
  const { accuracy, precision, recall, f1, confusion_matrix: cm, roc, feature_importance } = data

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontWeight: 500 }}>Results</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={downloadModel} style={{
            padding: '5px 14px', background: '#1a1a1a', color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12
          }}>Download model ↓</button>
          <button onClick={onReset} style={{
            padding: '5px 14px', background: 'transparent',
            border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 12
          }}>← Start over</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1rem' }}>
        {[['Accuracy', accuracy], ['Precision', precision], ['Recall', recall], ['F1 Score', f1]].map(([name, val]) => (
          <div key={name} style={{ background: '#f5f5f5', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 500 }}>{pct(val)}</p>
            <p style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{name}</p>
          </div>
        ))}
      </div>

      <div style={card}>
        <p style={label}>Confusion matrix</p>
        <table style={{ borderCollapse: 'collapse', fontSize: 13, margin: '0 auto' }}>
          <thead>
            <tr>
              <th style={th}></th>
              <th style={th}>Predicted 0</th>
              <th style={th}>Predicted 1</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th style={th}>Actual 0</th>
              <td style={{ ...td, color: '#0a58ca', fontSize: 20, fontWeight: 500 }}>{cm[0][0]}</td>
              <td style={{ ...td, color: '#c0392b', fontSize: 20, fontWeight: 500 }}>{cm[0][1]}</td>
            </tr>
            <tr>
              <th style={th}>Actual 1</th>
              <td style={{ ...td, color: '#c0392b', fontSize: 20, fontWeight: 500 }}>{cm[1][0]}</td>
              <td style={{ ...td, color: '#155724', fontSize: 20, fontWeight: 500 }}>{cm[1][1]}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={card}>
          <p style={label}>ROC curve</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={roc} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="fpr" tickCount={5} tickFormatter={v => v.toFixed(1)} fontSize={11} />
              <YAxis tickCount={5} tickFormatter={v => v.toFixed(1)} fontSize={11} />
              <Tooltip formatter={(v, n) => [v.toFixed(3), n === 'tpr' ? 'TPR' : 'FPR']} />
              <Line type="monotone" dataKey="tpr" stroke="#1a1a1a" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <p style={label}>Feature importance</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={feature_importance} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tickFormatter={v => `${v}%`} fontSize={11} />
              <YAxis type="category" dataKey="name" width={110} fontSize={11} />
              <Tooltip formatter={v => [`${v}%`, 'importance']} />
              <Bar dataKey="val" fill="#1a1a1a" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Predict />
    </div>
  )
}

const th = { padding: '8px 16px', border: '1px solid #e5e5e5', background: '#f9f9f9', fontSize: 12, fontWeight: 500, color: '#666', textAlign: 'center' }
const td = { padding: '10px 20px', border: '1px solid #e5e5e5', textAlign: 'center' }