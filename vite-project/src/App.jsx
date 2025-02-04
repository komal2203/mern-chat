import axios from 'axios'
import { UserContextProvider } from './UserContext'
import Routes from './Routes'

function App() {
  axios.defaults.baseURL =  "https://mern-chat-1-byovydozw-komal-meenas-projects.vercel.app/";

  axios.defaults.withCredentials = true

  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  )
}

export default App
