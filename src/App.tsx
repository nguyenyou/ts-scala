import { useState, useMemo } from 'react'
import { convertTsToScala } from './converter'

// ShadCN UI / Radix based primitives
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'

function App() {
  const [source, setSource] = useState<string>(`interface Person {\n  name: string;\n  age: number;\n}`)

  const scalaCode = useMemo(() => convertTsToScala(source), [source])

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen w-screen">
      {/* Input panel */}
      <ResizablePanel defaultSize={50} className="p-4">
        <div className="flex h-full flex-col gap-4">
          <h2 className="text-lg font-semibold">TypeScript definitions (.d.ts)</h2>
          <Textarea
            value={source}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSource(e.target.value)}
            spellCheck={false}
            className="flex-1 font-mono text-sm"
          />
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Output panel */}
      <ResizablePanel defaultSize={50} className="p-4">
        <div className="flex h-full flex-col gap-4">
          <h2 className="text-lg font-semibold">Scala 3 code</h2>
          <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/50">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{scalaCode}</pre>
          </ScrollArea>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default App
