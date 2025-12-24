import { lazy, Suspense } from 'react'
import type { EditorProps } from 'react-draft-wysiwyg'

// In Vite SPA there is no SSR, but the editor is still safer to load lazily.
const LazyEditor = lazy(async () => {
  const mod = await import('react-draft-wysiwyg')
  return { default: mod.Editor }
})

export default function ReactDraftWysiwyg(props: EditorProps) {
  return (
    <Suspense fallback={null}>
      <LazyEditor {...props} />
    </Suspense>
  )
}
