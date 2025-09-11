import React, { useState, useEffect, useRef } from "react"
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import draftToHtml from "draftjs-to-html"
import htmlToDraft from "html-to-draftjs"
import { convertToRaw, EditorState, ContentState } from "draft-js"

export default function EditorReact({ value, onChange = () => {} }) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty())
  const latestHtml = useRef(value)

  useEffect(() => {
    if (value !== latestHtml.current) {
      if (value) {
        const safeValue = typeof value === "string" ? value : String(value)
        const blocksFromHtml = htmlToDraft(value)
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
