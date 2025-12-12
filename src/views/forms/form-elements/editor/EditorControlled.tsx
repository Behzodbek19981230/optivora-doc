// ** React Imports
import { useState } from 'react'

// ** Third Party Imports
import { EditorState } from 'draft-js'

// ** Component Import
import ReactDraftWysiwyg from 'src/@core/components/react-draft-wysiwyg'
interface Props {
  editorState: EditorState
  onEditorStateChange: (data: EditorState) => void
}
const EditorControlled = (props: Props) => {
  // ** State

  return (
    <ReactDraftWysiwyg editorState={props.editorState} onEditorStateChange={data => props.onEditorStateChange(data)} />
  )
}

export default EditorControlled
