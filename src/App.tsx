import { useState, useMemo } from 'react'
import { convertTsToScala } from './converter'

// ShadCN UI / Radix based primitives
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Lucide icons
import { FileText, Code2, Copy, RotateCcw, Zap } from 'lucide-react'

function App() {
  const [source, setSource] = useState<string>(`// TypeScript Type Definitions
interface User {
  id: number;
  name: string;
  email?: string;
  isActive: boolean;
  roles: UserRole[];
}

interface Admin extends User {
  permissions: Permission[];
  lastLogin?: Date;
}

type UserRole = 'admin' | 'moderator' | 'user';

type Permission = 'read' | 'write' | 'delete';

interface Repository<T> {
  findById: (id: number) => T | null;
  save: (entity: T) => T;
  findAll: () => T[];
  update: (id: number, data: Partial<T>) => T;
}

interface ApiResponse<TData> {
  data: TData;
  success: boolean;
  message?: string;
  timestamp: Date;
}

type EventHandler<T> = (event: T) => void;

interface EventEmitter {
  on: <T>(event: string, handler: EventHandler<T>) => void;
  emit: <T>(event: string, data: T) => boolean;
}

enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending'
}

// Tuple types
interface Coordinates {
  position: [number, number];
  colors: [string, string, string];
}

// Intersection types
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type UserWithTimestamp = User & Timestamped;`)

  const scalaCode = useMemo(() => convertTsToScala(source), [source])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(scalaCode)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const resetToExample = () => {
    setSource(`// TypeScript Type Definitions
interface User {
  id: number;
  name: string;
  email?: string;
  isActive: boolean;
  roles: UserRole[];
}

interface Admin extends User {
  permissions: Permission[];
  lastLogin?: Date;
}

type UserRole = 'admin' | 'moderator' | 'user';

type Permission = 'read' | 'write' | 'delete';

interface Repository<T> {
  findById: (id: number) => T | null;
  save: (entity: T) => T;
  findAll: () => T[];
  update: (id: number, data: Partial<T>) => T;
}

interface ApiResponse<TData> {
  data: TData;
  success: boolean;
  message?: string;
  timestamp: Date;
}

type EventHandler<T> = (event: T) => void;

interface EventEmitter {
  on: <T>(event: string, handler: EventHandler<T>) => void;
  emit: <T>(event: string, data: T) => boolean;
}

enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending'
}

// Tuple types
interface Coordinates {
  position: [number, number];
  colors: [string, string, string];
}

// Intersection types
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type UserWithTimestamp = User & Timestamped;`)
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="size-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">TS → Scala</h1>
                  <p className="text-sm text-muted-foreground">TypeScript to Scala 3 Converter</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Code2 className="size-3" />
                v0.1.0
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-6">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border bg-background shadow-sm">
          {/* Input Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <Card className="h-full rounded-none border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="size-5 text-primary" />
                  TypeScript Definitions
                  <Badge variant="outline" className="ml-auto text-xs">
                    .d.ts
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 px-6 pb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetToExample}
                    className="gap-1.5"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset Example
                  </Button>
                </div>
                <Textarea
                  value={source}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSource(e.target.value)}
                  placeholder="Enter your TypeScript interface or type definitions here..."
                  spellCheck={false}
                  className="flex-1 font-mono text-sm resize-none border-0 shadow-none bg-muted/30 focus-visible:bg-background transition-colors"
                />
              </CardContent>
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle className="w-1 bg-border/50" />

          {/* Output Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <Card className="h-full rounded-none border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code2 className="size-5 text-emerald-600" />
                  Scala 3 Code
                  <Badge variant="outline" className="ml-auto text-xs">
                    .scala
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 px-6 pb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="gap-1.5"
                  >
                    <Copy className="size-3.5" />
                    Copy Code
                  </Button>
                </div>
                <ScrollArea className="flex-1 rounded-md border bg-muted/30 p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
                    {scalaCode || (
                      <span className="text-muted-foreground italic">
                        Enter TypeScript code to see the Scala conversion...
                      </span>
                    )}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

export default App
