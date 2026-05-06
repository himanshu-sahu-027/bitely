import { FaComments } from "react-icons/fa"

function ChatButton({ openChat }) {
  return (
    <button
      type="button"
      onClick={openChat}
      className="fixed bottom-24 right-6 rounded-full bg-indigo-600 p-4 text-white shadow-lg transition hover:bg-indigo-700"
    >

      <FaComments size={20} />

    </button>
  )
}

export default ChatButton
