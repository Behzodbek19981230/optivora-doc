import { ReactNode, useMemo } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

// ** Store Imports
import { store } from 'src/store'
import { Provider } from 'react-redux'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'
import type { EmotionCache } from '@emotion/cache'

// ** Config Imports
import { defaultACLObj } from 'src/configs/acl'

// ** Third Party Import
import { Toaster } from 'react-hot-toast'

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'
import AclGuard from 'src/@core/components/auth/AclGuard'
import ThemeComponent from 'src/@core/theme/ThemeComponent'
import AuthGuard from 'src/@core/components/auth/AuthGuard'
import GuestGuard from 'src/@core/components/auth/GuestGuard'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'

// ** Contexts
import { AuthProvider } from 'src/context/AuthContext'
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'

// ** Styled Components
import ReactHotToast from 'src/@core/styles/libs/react-hot-toast'

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// ** React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Pages (keep existing page components, but route them with React Router)
import HomePage from 'src/pages'
import LoginPage from 'src/pages/login'
import RegisterPage from 'src/pages/register'
import ForgotPasswordPage from 'src/pages/forgot-password'
import ChooseCompanyPage from 'src/pages/choose-company'
import CalendarPage from 'src/pages/calendar'
import DocumentsIndexPage from 'src/pages/documents'
import DocumentsStatusPage from 'src/pages/documents/[status]'
import DocumentViewPage from 'src/pages/documents/view/[id]'
import ArchivePage from 'src/pages/archive'
import CommandsIndexPage from 'src/pages/commands'
import CommandsCreatePage from 'src/pages/commands/create'
import CommandViewPage from 'src/pages/commands/[id]'
import CompanyIndexPage from 'src/pages/company'
import CompanyViewPage from 'src/pages/company/view'
import CompanyRedirectPage from 'src/pages/company/[id]/[tab]'
import DocumentFormPage from 'src/pages/document-form'
import ListOfMagazinePage from 'src/pages/list-of-magazine'
import LocationsPage from 'src/pages/locations'
import OrgPage from 'src/pages/org'
import ReplyLetterIndexPage from 'src/pages/reply-letter'
import ReplyLetterCreatePage from 'src/pages/reply-letter/create'
import ReplyLetterViewPage from 'src/pages/reply-letter/[id]'
import TasksIndexPage from 'src/pages/tasks'
import TaskCreatePage from 'src/pages/tasks/create'
import TaskUpdatePage from 'src/pages/tasks/update/[id]'
import TaskViewPage from 'src/pages/tasks/view/[id]'
import UiCardsActionsPage from 'src/pages/ui/cards/actions'
import UiCardsAdvancedPage from 'src/pages/ui/cards/advanced'
import UiCardsBasicPage from 'src/pages/ui/cards/basic'
import UiCardsWidgetsPage from 'src/pages/ui/cards/widgets'
import UiIconsPage from 'src/pages/ui/icons'
import UiIconsLogoPage from 'src/pages/ui/icons/Logo'
import UiTypographyPage from 'src/pages/ui/typography'
import UsersIndexPage from 'src/pages/users'
import UsersViewPage from 'src/pages/users/view'
import AclPage from 'src/pages/acl'
import Page401 from 'src/pages/401'
import Page404 from 'src/pages/404'
import Page500 from 'src/pages/500'

type GuardProps = {
  authGuard: boolean
  guestGuard: boolean
  children: ReactNode
}

const clientSideEmotionCache = createEmotionCache()
const queryClient = new QueryClient()

const Guard = ({ children, authGuard, guestGuard }: GuardProps) => {
  if (guestGuard) {
    return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>
  } else if (!guestGuard && !authGuard) {
    return <>{children}</>
  } else {
    return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>
  }
}

type RouteComponent = ((props: any) => JSX.Element) & {
  acl?: any
  authGuard?: boolean
  guestGuard?: boolean
  getLayout?: (page: ReactNode) => ReactNode
}

const RouteShell = ({ Component }: { Component: RouteComponent }) => {
  const authGuard = Component.authGuard ?? true
  const guestGuard = Component.guestGuard ?? false
  const aclAbilities = Component.acl ?? defaultACLObj

  const getLayout =
    Component.getLayout ??
    (page => {
      return <UserLayout>{page}</UserLayout>
    })

  return (
    <Guard authGuard={authGuard} guestGuard={guestGuard}>
      <AclGuard aclAbilities={aclAbilities} guestGuard={guestGuard} authGuard={authGuard}>
        {getLayout(<Component />)}
      </AclGuard>
    </Guard>
  )
}

export default function App({ emotionCache = clientSideEmotionCache }: { emotionCache?: EmotionCache }) {
  // Ensure SettingsProvider doesn't recreate pageSettings; we currently don't use per-page settings.
  const pageSettings = useMemo(() => undefined, [])

  return (
    <Provider store={store}>
      <CacheProvider value={emotionCache}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <SettingsProvider {...(pageSettings ? { pageSettings } : {})}>
                <SettingsConsumer>
                  {({ settings }) => (
                    <ThemeComponent settings={settings}>
                      <Routes>
                        <Route path='/' element={<RouteShell Component={HomePage as any} />} />
                        <Route path='/login' element={<RouteShell Component={LoginPage as any} />} />
                        <Route path='/register' element={<RouteShell Component={RegisterPage as any} />} />
                        <Route path='/forgot-password' element={<RouteShell Component={ForgotPasswordPage as any} />} />

                        <Route path='/choose-company' element={<RouteShell Component={ChooseCompanyPage as any} />} />

                        <Route path='/calendar' element={<RouteShell Component={CalendarPage as any} />} />

                        <Route path='/documents' element={<RouteShell Component={DocumentsIndexPage as any} />} />
                        <Route path='/documents/:status' element={<RouteShell Component={DocumentsStatusPage as any} />} />
                        <Route path='/documents/view/:id' element={<RouteShell Component={DocumentViewPage as any} />} />

                        <Route path='/archive' element={<RouteShell Component={ArchivePage as any} />} />

                        <Route path='/commands' element={<RouteShell Component={CommandsIndexPage as any} />} />
                        <Route path='/commands/create' element={<RouteShell Component={CommandsCreatePage as any} />} />
                        <Route path='/commands/:id' element={<RouteShell Component={CommandViewPage as any} />} />

                        <Route path='/company' element={<RouteShell Component={CompanyIndexPage as any} />} />
                        <Route path='/company/view' element={<RouteShell Component={CompanyViewPage as any} />} />
                        <Route path='/company/:id/:tab' element={<RouteShell Component={CompanyRedirectPage as any} />} />

                        <Route path='/document-form' element={<RouteShell Component={DocumentFormPage as any} />} />
                        <Route path='/list-of-magazine' element={<RouteShell Component={ListOfMagazinePage as any} />} />
                        <Route path='/locations' element={<RouteShell Component={LocationsPage as any} />} />
                        <Route path='/org' element={<RouteShell Component={OrgPage as any} />} />

                        <Route path='/reply-letter' element={<RouteShell Component={ReplyLetterIndexPage as any} />} />
                        <Route path='/reply-letter/create' element={<RouteShell Component={ReplyLetterCreatePage as any} />} />
                        <Route path='/reply-letter/:id' element={<RouteShell Component={ReplyLetterViewPage as any} />} />

                        <Route path='/tasks' element={<RouteShell Component={TasksIndexPage as any} />} />
                        <Route path='/tasks/create' element={<RouteShell Component={TaskCreatePage as any} />} />
                        <Route path='/tasks/update/:id' element={<RouteShell Component={TaskUpdatePage as any} />} />
                        <Route path='/tasks/view/:id' element={<RouteShell Component={TaskViewPage as any} />} />

                        <Route path='/ui/cards/actions' element={<RouteShell Component={UiCardsActionsPage as any} />} />
                        <Route path='/ui/cards/advanced' element={<RouteShell Component={UiCardsAdvancedPage as any} />} />
                        <Route path='/ui/cards/basic' element={<RouteShell Component={UiCardsBasicPage as any} />} />
                        <Route path='/ui/cards/widgets' element={<RouteShell Component={UiCardsWidgetsPage as any} />} />
                        <Route path='/ui/icons' element={<RouteShell Component={UiIconsPage as any} />} />
                        <Route path='/ui/icons/Logo' element={<RouteShell Component={UiIconsLogoPage as any} />} />
                        <Route path='/ui/typography' element={<RouteShell Component={UiTypographyPage as any} />} />

                        <Route path='/users' element={<RouteShell Component={UsersIndexPage as any} />} />
                        <Route path='/users/view' element={<RouteShell Component={UsersViewPage as any} />} />

                        <Route path='/acl' element={<RouteShell Component={AclPage as any} />} />

                        <Route path='/401' element={<RouteShell Component={Page401 as any} />} />
                        <Route path='/500' element={<RouteShell Component={Page500 as any} />} />
                        <Route path='/404' element={<RouteShell Component={Page404 as any} />} />

                        <Route path='*' element={<RouteShell Component={Page404 as any} />} />
                      </Routes>

                      <ReactHotToast>
                        <Toaster position={settings.toastPosition} toastOptions={{ className: 'react-hot-toast' }} />
                      </ReactHotToast>
                    </ThemeComponent>
                  )}
                </SettingsConsumer>
              </SettingsProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </CacheProvider>
    </Provider>
  )
}
