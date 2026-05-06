import ChatHeader from "./ChatHeader"
import MessageBubble from "./MessageBubble"
import ChatInput from "./ChatInput"

function ChatWindow({ messages, sendMessage, closeChat }) {

  return (

    <div className="fixed bottom-24 right-4 w-[320px] h-[420px] bg-white rounded-xl shadow-xl flex flex-col">

      <ChatHeader closeChat={closeChat} />

      {/* Messages */}

      <div className="flex-1 overflow-y-auto p-3 space-y-2">

        {messages.map((msg, index) => (

          <MessageBubble key={index} message={msg} />

        ))}

      </div>

      <ChatInput sendMessage={sendMessage} />

    </div>

  )
}

export default ChatWindow