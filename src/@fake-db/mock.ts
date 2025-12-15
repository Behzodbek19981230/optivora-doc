import MockAdapter from 'axios-mock-adapter'
import { client } from 'src/configs/dataService'

// Attach mock adapter to the same Axios instance used by DataService
const mock = new MockAdapter(client)

export default mock
