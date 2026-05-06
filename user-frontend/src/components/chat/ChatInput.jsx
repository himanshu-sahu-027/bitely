import { useState } from "react"
import { FaPaperPlane } from "react-icons/fa"

function ChatInput({ sendMessage }) {

  const [text, setText] = useState("")

  const handleSend = () => {

    if (!text.trim()) return

    sendMessage(text)

    setText("")
  }

  return (

    <div className="flex items-center border-t p-2">

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 outline-none text-sm px-2"
      />

      <button
        onClick={handleSend}
        className="text-indigo-600 p-2"
      >

        <FaPaperPlane />

      </button>

    </div>

  )
}

export default ChatInput