import React, { useState, useEffect, useRef } from "react"
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import draftToHtml from "draftjs-to-html"
import htmlToDraft from "html-to-draftjs"
import { convertToRaw, EditorState, ContentState } from "draft-js"

export default function EditorReact({ value, onChange = () => {} }) {
  // Helper to fix common HTML issues
  const fixMalformedHtml = (html) => {
    if (!html) return html
    // Fix malformed closing tags like <.h1> to </h1>
    return html.replace(/<\.(\w+)>/g, '</$1>')
  }

  const [editorState, setEditorState] = useState(() => {
    if (value) {
      const fixedValue = fixMalformedHtml(value)
      const blocksFromHtml = htmlToDraft(fixedValue)
      if (blocksFromHtml) {
        const { contentBlocks, entityMap } = blocksFromHtml
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        )
        return EditorState.createWithContent(contentState)
      }
    }
    return EditorState.createEmpty()
  })
  const latestHtml = useRef(value)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip first render since we initialize in useState
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Update editor only if incoming value differs from latest internal content
    if (value !== latestHtml.current) {
      if (value) {
        const fixedValue = fixMalformedHtml(value)
        const blocksFromHtml = htmlToDraft(fixedValue)
        if (blocksFromHtml) {
          const { contentBlocks, entityMap } = blocksFromHtml
          const contentState = ContentState.createFromBlockArray(
            contentBlocks,
            entityMap
          )
          setEditorState(EditorState.createWithContent(contentState))
        }
      } else {
        setEditorState(EditorState.createEmpty())
      }
      latestHtml.current = value
    }
  }, [value])

  const handleEditorChange = state => {
    setEditorState(state)
    const html = draftToHtml(convertToRaw(state.getCurrentContent()))
    latestHtml.current = html
    onChange(html)
  }

  return (
    <div>
      <Editor
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        toolbarClassName="toolbarClassName"
        wrapperClassName="wrapperClassName"
        editorClassName="editorClassName"
      />
    </div>
  )
}