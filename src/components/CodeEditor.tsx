import { EditorView } from "@codemirror/view"
import { EditorState, Transaction } from "@codemirror/state"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { json } from "@codemirror/lang-json"
import { java } from "@codemirror/lang-java"
import { javascript } from "@codemirror/lang-javascript"
import { basicSetup } from "codemirror"
import type { Extension } from "@codemirror/state"
import { memo, useEffect, useRef } from "react"
import {githubLight} from './github-light'

type EditorProps = {
  content: string
  onSaveContent?: (updatedContent: string, debounce: boolean) => void
  status?: "streaming" | "idle"
  language?: "markdown" | "java" | "json" | "javascript"
}

function PureCodeEditor({ content, onSaveContent, status, language = "markdown" }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorView | null>(null)

  const getLanguageSupport = (lang: "markdown" | "java" | "json" | "javascript"): Extension => {
    switch (lang) {
      case "markdown":
        return markdown({
          defaultCodeLanguage: java(),
          addKeymap: true,
          base: markdownLanguage,
        })
      case "java":
        return java()
      case "json":
        return json()
      case "javascript":
        return javascript({ typescript: true })
      default:
        return markdown({
          base: markdownLanguage,
          addKeymap: true,
        })
    }
  }

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      const startState = EditorState.create({
        doc: content,
        extensions: [
          basicSetup,
          getLanguageSupport(language),
          githubLight,
          EditorView.theme({
            "&": {
              height: "100%",
              maxHeight: "100%",
            },
            ".cm-scroller": {
              overflow: "auto",
            },
            ".cm-content": {
              minHeight: "100%",
            },
          }),
        ],
      })

      editorRef.current = new EditorView({
        state: startState,
        parent: containerRef.current,
      })
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
    // NOTE: we only want to run this effect once
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (editorRef.current) {
      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const transaction = update.transactions.find((tr) => !tr.annotation(Transaction.remote))

          if (transaction) {
            const newContent = update.state.doc.toString()
            onSaveContent?.(newContent, true)
          }
        }
      })

      const currentSelection = editorRef.current.state.selection

      const newState = EditorState.create({
        doc: editorRef.current.state.doc,
        extensions: [basicSetup, getLanguageSupport(language), githubLight, updateListener],
        selection: currentSelection,
      })

      editorRef.current.setState(newState)
    }
  }, [language])

  useEffect(() => {
    if (editorRef.current && content) {
      const currentContent = editorRef.current.state.doc.toString()

      if (status === "streaming" && currentContent !== content) {
        const transaction = editorRef.current.state.update({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
          annotations: [Transaction.remote.of(true)],
        })

        editorRef.current.dispatch(transaction)
      }
    }
  }, [content, status, editorRef])

  return <div className="relative not-prose w-full h-full text-sm cursor-text" ref={containerRef} />
}

function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
  if (prevProps.status === "streaming" && nextProps.status === "streaming") return false
  if (prevProps.content !== nextProps.content) return false
  if (prevProps.language !== nextProps.language) return false

  return true
}

export const CodeEditor = memo(PureCodeEditor, areEqual)