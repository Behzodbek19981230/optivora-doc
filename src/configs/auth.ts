export default {
  meEndpoint: '/user-view',
  loginEndpoint: '/auth/token',
  registerEndpoint: '/auth/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
