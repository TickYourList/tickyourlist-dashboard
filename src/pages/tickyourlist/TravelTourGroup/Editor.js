import React, { useState, useEffect, useRef } from "react"
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import draftToHtml from "draftjs-to-html"
import htmlToDraft from "html-to-draftjs"
import { convertToRaw, EditorState, ContentState, Modifier } from "draft-js"
import { Button } from "reactstrap"

export default function EditorReact({ value, onChange = () => { } }) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty())
  const latestHtml = useRef(null)
  const isInitialized = useRef(false)

  // Function to strip ALL problematic styles from HTML (including margin, padding, etc.)
  const stripFontStyles = (html) => {
    if (!html) return html

    // Remove all common problematic inline styles
    let cleanedHtml = html
      // Font styles
      .replace(/font-family:\s*[^;}\"']+;?/gi, '')
      .replace(/font-size:\s*[^;}\"']+;?/gi, '')
      .replace(/font-weight:\s*[^;}\"']+;?/gi, '')
      // Margin and padding (including margin-left that causes indentation)
      .replace(/margin-left:\s*[^;}\"']+;?/gi, '')
      .replace(/margin-right:\s*[^;}\"']+;?/gi, '')
      .replace(/margin-top:\s*[^;}\"']+;?/gi, '')
      .replace(/margin-bottom:\s*[^;}\"']+;?/gi, '')
      .replace(/margin:\s*[^;}\"']+;?/gi, '')
      .replace(/padding-left:\s*[^;}\"']+;?/gi, '')
      .replace(/padding-right:\s*[^;}\"']+;?/gi, '')
      .replace(/padding-top:\s*[^;}\"']+;?/gi, '')
      .replace(/padding-bottom:\s*[^;}\"']+;?/gi, '')
      .replace(/padding:\s*[^;}\"']+;?/gi, '')
      // Text indentation
      .replace(/text-indent:\s*[^;}\"']+;?/gi, '')
      // Line height and letter spacing
      .replace(/line-height:\s*[^;}\"']+;?/gi, '')
      .replace(/letter-spacing:\s*[^;}\"']+;?/gi, '')
      // Colors (keep text readable by removing background)
      .replace(/background-color:\s*[^;}\"']+;?/gi, '')
      .replace(/background:\s*[^;}\"']+;?/gi, '')
      // Remove color styles that may conflict
      .replace(/color:\s*[^;}\"']+;?/gi, '')
      // Width and height
      .replace(/width:\s*[^;}\"']+;?/gi, '')
      .replace(/height:\s*[^;}\"']+;?/gi, '')
      // Clean up empty style attributes and extra semicolons
      .replace(/style="\s*;*\s*"/gi, '')
      .replace(/style=''/gi, '')
      .replace(/style="\s*"/gi, '')
      // Clean up multiple semicolons from removed styles
      .replace(/;\s*;+/g, ';')
      .replace(/style=";\s*/gi, 'style="')
      .replace(/;\s*"/g, '"')

    return cleanedHtml
  }

  // Normalize value for comparison (treat null, undefined, '' as equivalent)
  const normalizeValue = (val) => {
    if (!val || val === '<p></p>' || val === '<p></p>\n') return ''
    return val
  }

  useEffect(() => {
    const normalizedValue = normalizeValue(value)
    const normalizedLatest = normalizeValue(latestHtml.current)

    // Initialize or update editor when value meaningfully changes
    // Or when receiving a non-empty value for the first time (data loaded)
    const hasNewContent = normalizedValue && !isInitialized.current
    const valueChanged = normalizedValue !== normalizedLatest

    if (hasNewContent || valueChanged) {
      if (value) {
        const blocksFromHtml = htmlToDraft(value)
        if (blocksFromHtml) {
          const { contentBlocks, entityMap } = blocksFromHtml
          const contentState = ContentState.createFromBlockArray(
            contentBlocks,
            entityMap
          )
          setEditorState(EditorState.createWithContent(contentState))
          isInitialized.current = true
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

  // Handle pasted text - strip all problematic styles automatically
  const handlePastedText = (text, html) => {
    // If HTML is available, clean it and use it
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

    // If only plain text is available, insert it as plain text (no styles)
    if (text) {
      const currentContentState = editorState.getCurrentContent()
      const selection = editorState.getSelection()

      const newContentState = Modifier.insertText(
        currentContentState,
        selection,
        text
      )

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        'insert-characters'
      )

      handleEditorChange(newEditorState)
      return true
    }

    return false
  }

  // Function to clear all formatting styles from current content
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
          title="Remove all formatting styles (margins, fonts, colors, etc.) from existing content"
        >
          <i className="bx bx-eraser me-1"></i>
          Clear All Formatting
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
