// ** React Imports
import { ReactNode, useContext } from 'react'

// ** Component Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** Types
import { NavLink } from 'src/@core/layouts/types'

interface Props {
  navLink?: NavLink
  children: ReactNode
}

const CanViewNavLink = (props: Props) => {
  // ** Props
  const { children, navLink } = props

  // ** Hook
  const ability = useContext(AbilityContext)

  // If link explicitly disables auth, always show it
  if (navLink && navLink.auth === false) {
    return <>{children}</>
  }

  // If no action/subject defined on nav item, do not restrict by ACL
  if (!navLink?.action || !navLink?.subject) {
    return <>{children}</>
  }

  // Otherwise, enforce ACL
  return ability && ability.can(navLink.action, navLink.subject) ? <>{children}</> : null
}

export default CanViewNavLink
