import React, { useState, useEffect, useRef } from "react"
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import draftToHtml from "draftjs-to-html"
import htmlToDraft from "html-to-draftjs"
import { convertToRaw, EditorState, ContentState, Modifier } from "draft-js"
import { Button } from "reactstrap"

export default function EditorReact({ value, onChange = () => {} }) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty())
  const latestHtml = useRef(value)

  // Function to strip font-family and font-size from HTML
  const stripFontStyles = (html) => {
    if (!html) return html
    
    // Remove inline font-family and font-size styles
    let cleanedHtml = html
      .replace(/font-family:\s*[^;}"']+;?/gi, '')
      .replace(/font-size:\s*[^;}"']+;?/gi, '')
      // Clean up empty style attributes
      .replace(/style="\s*"/gi, '')
      .replace(/style=''/gi, '')
    
    return cleanedHtml
  }

  useEffect(() => {
    // Update editor only if incoming value differs from latest internal content
    if (value !== latestHtml.current) {
      if (value) {
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

  // Handle pasted text - strip font styles
  const handlePastedText = (text, html) => {
    if (html) {
      const cleanedHtml = stripFontStyles(html)
      const blocksFromHtml = htmlToDraft(cleanedHtml)
      
      if (blocksFromHtml) {
        const { contentBlocks, entityMap } = blocksFromHtml
        const pastedContentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        )
        
        const currentContentState = editorState.getCurrentContent()
        const selection = editorState.getSelection()
        
        const newContentState = Modifier.replaceWithFragment(
          currentContentState,
          selection,
          pastedContentState.getBlockMap()
        )
        
        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          'insert-fragment'
        )
        
        handleEditorChange(newEditorState)
        return true // Prevent default paste behavior
      }
    }
    return false
  }

  // Function to clear font styles from current content
  const clearFontStyles = () => {
    const currentHtml = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    const cleanedHtml = stripFontStyles(currentHtml)
    
    const blocksFromHtml = htmlToDraft(cleanedHtml)
    if (blocksFromHtml) {
      const { contentBlocks, entityMap } = blocksFromHtml
      const contentState = ContentState.createFromBlockArray(
        contentBlocks,
        entityMap
      )
      const newEditorState = EditorState.createWithContent(contentState)
      handleEditorChange(newEditorState)
    }
  }

  return (
    <div>
      <div className="mb-2">
        <Button
          type="button"
          color="warning"
          size="sm"
          onClick={clearFontStyles}
          title="Remove all font-family and font-size styles"
        >
          <i className="bx bx-eraser me-1"></i>
          Clear Font Styles
        </Button>
      </div>
      <Editor
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        handlePastedText={handlePastedText}
        toolbarClassName="toolbarClassName"
        wrapperClassName="wrapperClassName"
        editorClassName="editorClassName"
        toolbar={{
          options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
          inline: {
            options: ['bold', 'italic', 'underline', 'strikethrough'],
          },
        }}
      />
    </div>
  )
}
