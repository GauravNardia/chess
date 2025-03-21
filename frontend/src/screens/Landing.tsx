import React from 'react'
import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div>
       <div className='mt-2'>
         <div className='grid grid-cols-1 gap-4 md:grid-cols-2' >
           <div>
              <img src={"/chessboard.jpeg"} />
           </div>
           <div className='p-5'>
             <h1 className='text-4xl font-bold text-white ' >
               Play chess online on the #3 Site!
             </h1>
             <p className='text-lg mt-2 text-gray-400 ' >
              Play chess with your friends
             </p>
             <div className='mt-4' >
               <button onClick={() => { navigate("/game") } } className='bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded' >
                Play Online
               </button>
             </div>
           </div>
         </div>
       </div>
    </div>
  )
}

export default Landing