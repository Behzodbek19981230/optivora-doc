/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = (roles: string[]) => {
  if (roles.includes('Admin')) {
    return '/'
  }
  if (roles.includes('Manager')) {
    return '/'
  }
  if (roles.includes('Performer')) {
    return '/calendar'
  }
  if (roles.includes('Signatory')) {
    return '/calendar'
  }

  return '/login'
}

export default getHomeRoute
