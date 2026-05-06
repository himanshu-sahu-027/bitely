import { FaTimes } from "react-icons/fa"

function ChatHeader({ closeChat }) {

  return (

    <div className="flex justify-between items-center bg-indigo-600 text-white p-3 rounded-t-xl">

      <div>

        <p className="font-semibold">Kitchen Support</p>

        <p className="text-xs opacity-80">
          Usually replies in few minutes
        </p>

      </div>

      <button onClick={closeChat}>
        <FaTimes />
      </button>

    </div>

  )
}

export default ChatHeader