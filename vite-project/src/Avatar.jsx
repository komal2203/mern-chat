import { useState } from 'react'

export default function Avatar({ userId,username, online }) {
  const colors = [
    'bg-pink-200',
    'bg-yellow-200',
    'bg-teal-200',
    'bg-green-200',
    'bg-blue-200',
    'bg-purple-200',
    'bg-orange-200',
    'bg-red-200',
  ]

  const [color] = useState(() => {
    const colorIndex = Math.floor(Math.random() * colors.length)
    return colors[colorIndex]
  })

  //   console.log('Assigned color:', color) // Debugging check

  return (
    <div className={`w-8 h-8 relative rounded-full flex items-center ${color}`}>
      <div className="text-center w-full opacity-75">
        {username[0]}
      </div>
      {online && (
        <div
          className="absolute h-2 w-2 bg-green-400 bottom-0 right-0 rounded-full border 
          border-white"></div>
      )}
      {!online && (
        <div
          className="absolute h-2 w-2 bg-gray-400 bottom-0 right-0 rounded-full border 
          border-white"></div>
      )}
    </div>
  )
}
