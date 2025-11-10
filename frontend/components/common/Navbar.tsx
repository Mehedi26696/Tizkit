// Navbar component
import React from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'

const Navbar = () => {
  return (
    <div className='flex flex-row items-center justify-around w-full min-w-5xl p-4 fixed top-0 left-0 bg-orange-300/80 backdrop-blur-sm z-50'>
      <div>
        <Image src="/images/Logo3.png" alt="Logo" width={140} height={140}/>
      </div>

      <div className='flex border-1 border-white rounded-full px-6 py-4 bg-transparent text-white'>
        <ul className='flex gap-7'>
            <li className='text-lg font-light hover:text-orange-500 cursor-pointer hover:underline-offset-1'>Home</li>
            <li className='text-lg font-light hover:text-orange-500 cursor-pointer hover:underline-offset-1'>
                Services
            </li>
            <li className='text-lg font-light hover:text-orange-500 cursor-pointer hover:underline-offset-1'>Features</li>
            <li className='text-lg font-light hover:text-orange-500 cursor-pointer hover:underline-offset-1'>How It Works</li>
            <li className='text-lg font-light hover:text-orange-500 cursor-pointer hover:underline-offset-1'>Pricing</li>
            <li className='text-lg font-light hover:text-orange-500 cursor-pointer hover:underline-offset-1'>Contact</li>
        </ul>
      </div>

      <div className='flex gap-4'>
        <Button className='border-1 border-gray-600 rounded-full px-6 py-4 bg-transparent text-gray-900 font-bold hover:bg-orange-400 hover:text-white cursor-pointer'>
            Login
        </Button>
        <Button className='border-1 border-gray-600 rounded-full px-6 py-4 bg-gray-900 text-white font-bold hover:bg-black cursor-pointer'>
            SignUp
        </Button>
      </div>
    </div>
  )
}

export default Navbar
