/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = (roles: string[]) => {
  if (roles.includes('Admin')) {
    return '/dashboards'
  }
  if (roles.includes('Manager')) {
    return '/dashboards'
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
