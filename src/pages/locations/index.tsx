import LocationTable from 'src/views/locations/LocationTable'

const LocationsPage = () => <LocationTable />

LocationsPage.acl = { action: 'read', subject: 'cms' }
LocationsPage.authGuard = true

export default LocationsPage
