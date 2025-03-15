import SavedCards from "../../components/shared/SavedCards"

//comment
const Saved = () => {
  return (
    <div className="md:ml-[20%] w-full bg-black">
      <div className="flex justify-center items-center w-full mt-6 mb-4">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r
         from-purple-500 to-pink-500 drop-shadow-md border-b-2 border-gray-300 pb-2 transition-all
         duration-300 ease-in-out hover:scale-105 hover:from-pink-500 hover:to-purple-500 hover:drop-shadow-lg cursor-pointer">
          Saved Posts
        </h1>
      </div>

      <div className="flex justify-center items-center w-full mt-2"><SavedCards /></div>
    </div>
  )
}

export default Saved