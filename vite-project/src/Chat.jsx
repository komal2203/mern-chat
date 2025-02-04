import { useContext, useEffect, useRef, useState } from 'react'
// import Avatar from './Avatar.jsx'
import axios from 'axios'
import { uniqBy } from 'lodash'
import Contact from './Contact.jsx'
import Logo from './Logo.jsx'
import { UserContext } from './UserContext.jsx'

export default function Chat() {
  const [ws, setWs] = useState(null)
  const [onlinePeople, setOnlinePeople] = useState({})
  const [offlinePeople, setOfflinePeople] = useState({})
  const [selectedUserId, setSelectedUserId] = useState()
  const { username, id, setId, setUsername } = useContext(UserContext)
  const [newMessageText, setNewMessageText] = useState('')
  const [messages, setMessages] = useState([])
  const divUnderMessages = useRef()

  useEffect(() => {
    connectToWs()
  }, [])

  function connectToWs() {
    const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL)
    setWs(ws)
    ws.addEventListener('open', () => {
      console.log('WebSocket connected')
    })
    ws.addEventListener('message', handleMessage)
    ws.addEventListener('close', () => {
      setTimeout(() => {
        console.log('Disconnected. Trying to reconnect!!')
        connectToWs()
      }, 1000)
    })
  }

  function showOnlinePeople(peopleArray) {
    const people = {}
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username
    })
    setOnlinePeople(people)
  }

  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data)
    console.log({ ev, messageData })

    if ('online' in messageData) {
      showOnlinePeople(messageData.online)
    } else if ('text' in messageData) {
      console.log({ messageData })
      setMessages((prev) => [...prev, { ...messageData }])
    }
  }

  function logout() {
    axios.post('/logout').then(() => {
      setWs(null)
      setId(null)
      setUsername(null)
    })
  }

  function sendMessage(ev) {
    ev.preventDefault()
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      })
    )
    console.log('sending')
    setNewMessageText('')
    setMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
        _id: Date.now(),
      },
    ])
  }

  useEffect(() => {
    const div = divUnderMessages.current
    if (div) {
      div.scrollIntoView({ behaviour: 'smooth', block: 'end' })
    }
  }, [messages])

  useEffect(() => {
    axios.get('/people').then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id))
      const offlinePeople = {}
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p
      })
      // console.log({ offlinePeople, offlinePeopleArr })
      setOfflinePeople(offlinePeople)
    })
  }, [onlinePeople])

  useEffect(() => {
    if (selectedUserId) {
      axios.get('/messages/' + selectedUserId).then((res) => {
        setMessages(res.data)
      })
    }
  }, [selectedUserId])

  const onlinePeopleExcludingOurUser = { ...onlinePeople }
  delete onlinePeopleExcludingOurUser[id]

  // console.log('dupes')
  const messagesWithoutDupes = uniqBy(messages, '_id')

  return (
    <div className="flex h-screen">
      <div className="bg-purple-100 w-1/3 p-2 flex flex-col">
        <div className="flex-grow">
          <Logo />
          {Object.keys(onlinePeopleExcludingOurUser).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExcludingOurUser[userId]}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
        </div>
        <div className="p-2 text-center flex items-center justify-between">
          <span className="mr-2 text-sm text-purple-400 flex items-center hover:text-purple-500 hover:scale-110 transition-transform duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6">
              <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                clipRule="evenodd"
              />
            </svg>
            <div>{username}</div>
          </span>
          <button
            onClick={logout}
            className="text-sm bg-purple-300  rounded-2xl py-1.5 px-2.5 text-gray-600 hover:bg-purple-500 hover:text-white hover:scale-110 transition-transform duration-100 ">
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col  w-2/3 p-2 min-h-screen bg-[url('./images/seven.avif')] bg-cover bg-fixed bg-center">
        <div className="flex-grow h-full">
          {!selectedUserId && (
            <div className="flex justify-center items-center h-full flex-grow gap-2">
              <div className="text-gray-400 w-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-gray-400 text-md">
                Tap on a friend to start chatting!😄
              </div>
            </div>
          )}
          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 bottom-2 left-0 right-0">
                {messagesWithoutDupes.map((message) => (
                  <div
                    key={message._id}
                    className={
                      'pr-4 ' +
                      (message.sender === id ? 'text-right' : 'text-left')
                    }>
                    <div
                      className={
                        'text-left inline-block py-2 px-3  my-2 rounded-3xl text-sm ' +
                        (message.sender === id
                          ? 'bg-purple-400 text-white'
                          : 'bg-white text-gray-500')
                      }>
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
          {/* {!!selectedUserId && (
            <div>
              {messagesWithoutDupes.map((message, index) => (
                <div key={index}>
                  sender:{message.sender}
                  <br />
                  id:{id}
                  <br />
                  {message.text}
                </div> // Use `index` or `message.id` as the key
              ))}
            </div>
          )} */}
        </div>

        {!!selectedUserId && (
          <form className="flex gap-1" onSubmit={sendMessage}>
            <input
              type="text"
              value={newMessageText}
              onChange={(ev) => setNewMessageText(ev.target.value)}
              className="bg-white border-2 border-purple-200 focus:border-purple-400 focus:outline-none p-2 rounded-xl flex-grow"
              placeholder="Type your message here"
            />
            <button
              type="submit"
              className="bg-purple-400 p-2 text-white rounded-3xl border-2 border-purple-200 focus:bg-purple-400 focus:outline-none hover:bg-purple-500 hover:scale-105 duration-150">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
