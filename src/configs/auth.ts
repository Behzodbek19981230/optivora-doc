export default {
  meEndpoint: '/api/v1/user-view',
  loginEndpoint: '/api/v1/auth/token',
  registerEndpoint: '/api/v1/auth/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
