import { useTheme } from '@mui/material/styles'
import toast, { ToastOptions } from 'react-hot-toast'

type Options = ToastOptions | undefined

const useThemedToast = () => {
  const theme = useTheme()

  const success = (message: string, opts?: Options) =>
    toast.success(message, {
      style: {
        padding: '16px',
        color: theme.palette.primary.main,
        border: `1px solid ${theme.palette.primary.main}`
      },
      iconTheme: {
        primary: theme.palette.primary.main,
        secondary: theme.palette.primary.contrastText
      },
      ...opts
    })

  const error = (message: string, opts?: Options) =>
    toast.error(message, {
      style: {
        padding: '16px',
        color: theme.palette.error.main,
        border: `1px solid ${theme.palette.error.main}`
      },
      iconTheme: {
        primary: theme.palette.error.main,
        secondary: theme.palette.getContrastText(theme.palette.error.main)
      },
      ...opts
    })

  const info = (message: string, opts?: Options) =>
    toast(message, {
      style: {
        padding: '16px',
        color: theme.palette.info.main,
        border: `1px solid ${theme.palette.info.main}`
      },
      iconTheme: {
        primary: theme.palette.info.main,
        secondary: theme.palette.getContrastText(theme.palette.info.main)
      },
      ...opts
    })

  return { success, error, info }
}

export default useThemedToast
