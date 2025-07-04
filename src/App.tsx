import { useState, useMemo } from 'react'
import { convertTsToScala } from './converter'
import './App.css'

function App() {
  const [source, setSource] = useState<string>(`interface Person {\n  name: string;\n  age: number;\n}`)

  const scalaCode = useMemo(() => convertTsToScala(source), [source])

  return (
    <div className="container">
      <textarea
        className="panel input"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        spellCheck={false}
      />
      <pre className="panel output">{scalaCode}</pre>
    </div>
  )
}

export default App
