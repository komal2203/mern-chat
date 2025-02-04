import Avatar from './Avatar'

export default function Contact({ id, username, onClick, selected, online }) {
  return (
    <div
      key={id}
      onClick={() => {
        onClick(id)
      }}
      className={
        'border-b border-gray-100 flex items-center gap-2 cursor-pointer hover:bg-purple-200 ' +
        (selected ? 'bg-purple-300' : 'bg-purple-100')
      }>
      {selected && <div className="w-1 bg-purple-400 h-12 rounded-r-md"></div>}
      <div className="flex items-center gap-2 py-2 pl-4">
        <Avatar online={online} username={username} userId={id} />
        <span className="text-gray-800">{username}</span>
      </div>
    </div>
  )
}
