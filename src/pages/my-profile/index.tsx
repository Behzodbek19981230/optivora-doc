import MyProfilePage from 'src/views/my-profile/MyProfilePage'

const MyProfile = () => {
  return <MyProfilePage />
}

MyProfile.acl = { action: 'read', subject: 'my-profile' }
MyProfile.authGuard = true

export default MyProfile
