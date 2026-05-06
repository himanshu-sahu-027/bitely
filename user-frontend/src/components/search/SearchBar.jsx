import { FaSearch } from "react-icons/fa"

function SearchBar() {
  return (
    <div className="w-full flex justify-center mt-6">

      <div className="flex items-center bg-white shadow-md rounded-full px-4 py-2 w-[90%] md:w-[500px]">

        <FaSearch className="text-gray-400 mr-2" />

        <input
          type="text"
          placeholder="Search food or kitchen..."
          className="w-full outline-none text-sm"
        />

      </div>

    </div>
  )
}

export default SearchBar