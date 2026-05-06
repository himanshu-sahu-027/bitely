function MessageBubble({ message }) {

  const isUser = message.sender === "user"

  return (

    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>

      <div
        className={`px-3 py-2 rounded-lg text-sm max-w-[70%]
        ${isUser
          ? "bg-indigo-600 text-white"
          : "bg-gray-200 text-gray-800"
        }`}
      >

        {message.text}

      </div>

    </div>

  )
}

export default MessageBubble