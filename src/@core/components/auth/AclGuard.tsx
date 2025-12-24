// ** React Imports
import { ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Types
import type { ACLObj, AppAbility } from 'src/configs/acl'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** Config Import
import { buildAbilityFor, defaultACLObj } from 'src/configs/acl'

// ** Component Import
import NotAuthorized from 'src/pages/401'
import NotFound from 'src/pages/404'
import Spinner from 'src/@core/components/spinner'
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** Navigation (role-based route access)
import navigation from 'src/navigation/vertical'

// ** Util Import

interface AclGuardProps {
  children: ReactNode
  authGuard?: boolean
  guestGuard?: boolean
  aclAbilities: ACLObj
}

const AclGuard = (props: AclGuardProps) => {
  // ** Props
  const { children, authGuard = true, guestGuard = false, aclAbilities } = props

  // ** Hooks
  const auth = useAuth()
  const router = useRouter()

  // Allow error pages and routes without auth guard
  if (router.route === '/404' || router.route === '/500' || !authGuard || guestGuard) {
    return <>{children}</>
  }

  // While auth is resolving, show spinner
  if (auth.loading) {
    return <Spinner />
  }

  // Enforce navigation role access on direct URL visits:
  // If current path matches a nav item's path (or its subpaths) and the user lacks required role -> 404
  try {
    const navItems = navigation() as any[]
    const rules = (navItems || []).filter(i => i?.path && Array.isArray(i?.roles) && i.roles.length > 0) as Array<{
      path: string
      roles: string[]
    }>

    const userRoleIds = ((auth.user as any)?.role_detail || [])
      .map((r: any) => String(r?.id))
      .filter(Boolean) as string[]
    const currentPath = (router.asPath || '/').split('?')[0] || '/'

    const matched = rules.find(r => {
      if (r.path === '/') return currentPath === '/'

      return currentPath === r.path || currentPath.startsWith(`${r.path}/`)
    })

    if (matched) {
      const ok = matched.roles.some(r => userRoleIds.includes(String(r)))
      if (!ok) {
        return (
          <BlankLayout>
            <NotFound />
          </BlankLayout>
        )
      }
    }
  } catch {
    // ignore guard failures to avoid breaking the app
  }

  // Build ability from user role; default to 'admin' for full access unless backend provides a role
  const role = (auth.user as any)?.role_detail?.map((role: any) => role.name) || ['admin']
  const ability = buildAbilityFor(role, aclAbilities.subject) as AppAbility

  // If no explicit ACL specified (defaults to manage all), don't enforce ACL and just provide ability context
  const isDefaultAcl = aclAbilities.action === defaultACLObj.action && aclAbilities.subject === defaultACLObj.subject
  if (isDefaultAcl) {
    return <AbilityContext.Provider value={ability as any}>{children}</AbilityContext.Provider>
  }

  // Enforce page ACL
  const allowed = ability && ability.can(aclAbilities.action, aclAbilities.subject)

  return allowed ? (
    <AbilityContext.Provider value={ability as any}>{children}</AbilityContext.Provider>
  ) : (
    <BlankLayout>
      <NotAuthorized />
    </BlankLayout>
  )
}

export default AclGuard
