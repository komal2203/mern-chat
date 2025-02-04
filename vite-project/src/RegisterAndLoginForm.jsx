import { useContext, useState } from 'react'
import axios from 'axios'
import { UserContext } from './UserContext'

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('register')

  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext)

  async function handleSubmit(ev) {
    ev.preventDefault()
    const url = isLoginOrRegister === 'login' ? '/login' : '/register'

    try {
      const { data } = await axios.post(url, { username, password })

      setLoggedInUsername(username)
      setId(data.id)
    } catch (error) {
      console.error('Error during submission:', error)
      // You can add an alert or error message here
      alert('An error occurred.register faileddd. Please try again.')
    }

    // const { data } = await axios.post(url, { username, password })

    // setLoggedInUsername(username)
    // setId(data.id)
  }
  return (
    <div className="h-screen flex items-center bg-[url('./images/three.avif')] bg-cover bg-fixed bg-center">
      <form
        action=""
        className=" w-64 mx-auto bg-white-50 mb-12"
        onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          type="text"
          placeholder="username"
          className="bg-white  block w-full rounded-xl p-2 mb-2  border-2 border-white focus:border-purple-300 focus:outline-none"
        />

        <input
          value={password}
          onChange={(ev) => {
            setPassword(ev.target.value)
          }}
          type="password"
          placeholder="password"
          className="bg-white block  w-full rounded-xl p-2 mb-2  border-2 border-white  focus:border-purple-300 focus:outline-none"
        />

        <button className="bg-purple-400 block text-white w-full rounded-xl p-2 hover:bg-purple-500 hover:scale-103 transition-all duration-200 font-medium">
          {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
        </button>

        <div className="text-center text-md mt-2 text-purple-600">
          {isLoginOrRegister === 'register' && (
            <div>
              {' '}
              Already a member?
              <br />
              <button
                className="font-medium cursor-pointer "
                onClick={() => setIsLoginOrRegister('login')}>
                Login here
              </button>
            </div>
          )}
          {isLoginOrRegister === 'login' && (
            <div>
              {' '}
              Dont have an account?
              <br />
              <button
                className="font-medium cursor-pointer "
                onClick={() => setIsLoginOrRegister('register')}>
                Register here
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
