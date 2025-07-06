import { useMemo, useState } from "react";
import { convertTsToScala } from "./converter";

// ShadCN UI / Radix based primitives
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CodeViewer } from "./components/CodeViewer";

// Lucide icons
import { Code2, Copy, FileText, RotateCcw, Zap } from "lucide-react";
import { CodeEditor } from "./components/CodeEditor";

const example = `interface Person {
  name: string;
  age: number;
}

type AnotherPerson = {
  name: string;
  age: number;
}

type Color = "red" | "green" | "blue";

type Age = number | string;

type ButtonProps = {
  label: string;
  color: Color;
}`

function App() {
  const [source, setSource] = useState<string>(example);


  const scalaCode = useMemo(() => convertTsToScala(source), [source]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(scalaCode);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const resetToExample = () => {
    setSource(example);
  };

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
                  <h1 className="text-2xl font-bold tracking-tight">
                    TS → Scala
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    TypeScript to Scala 3 Converter
                  </p>
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
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full rounded-lg border bg-background shadow-sm"
        >
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
                <div className="flex-1 !cursor-text">
                  <CodeEditor
                    content={source}
                    onSaveContent={(updatedContent, _) => {
                      setSource(updatedContent);
                    }}
                    language="javascript"
                  />
                </div>
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
                <div className="flex-1">
                  <CodeViewer code={scalaCode} />
                </div>
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export default App;
