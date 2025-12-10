'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { OnlyOfficeComponent } from './OnlyOfficeComponent'

const OnlyOffice = ({ config }: { config: any }) => {
  const [isEdit, setIsEdit] = useState<boolean>(false)

  config.editorConfig = {
    ...config.editorConfig,
    customization: {
      uiTheme: 'theme-light',
      forcesave: true
    },

    lang: 'ru'
  }

  // Token optional; JWT is disabled in our OnlyOffice container

  useEffect(() => {
    const links = document.querySelectorAll('a')

    if (isEdit) {
      links.forEach(link => {
        link.addEventListener('click', handleLinkClick)
      })
      window.addEventListener('beforeunload', handleLinkClick)
    } else {
      links.forEach(link => {
        link.removeEventListener('click', handleLinkClick)
        window.removeEventListener('beforeunload', handleLinkClick)
      })
    }

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleLinkClick)
        window.removeEventListener('beforeunload', handleLinkClick)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit])

  const onDocumentStateChange = useCallback(() => {
    setIsEdit(true)
  }, [])

  const handleLinkClick = useCallback((event: MouseEvent | BeforeUnloadEvent) => {
    if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      event.preventDefault()
    }
  }, [])

  // Render editor without token if JWT is disabled

  return (
    <>
      <OnlyOfficeComponent
        fileId={config.document.key}
        onlyOfficeConfig={config}
        onDocumentStateChange={onDocumentStateChange}
      />
    </>
  )
}

export default OnlyOffice
