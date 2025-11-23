// Navbar component
import React from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'
import Link from 'next/link'

const Navbar = () => {
  return (
    <div className='flex flex-row items-center justify-around w-full min-w-5xl p-4 fixed top-0 left-0 bg-transparent/80 backdrop-blur-sm z-50'>
      <div>
        <Image
          src="/images/Log.png"
          alt="Logo"
          width={150}
          height={40}
          className='cursor-pointer'
        />
      </div>

      <div className='flex border-1 border-[#FA5F55]/30 rounded-full px-6 py-4 bg-transparent text-gray-900'>
        <ul className='flex gap-8'>
            <li className='text-md font-extralight hover:text-[#FA5F55] cursor-pointer hover:underline-offset-1 transition-colors duration-300'>Home</li>
            <li className='text-md font-extralight hover:text-[#FA5F55] cursor-pointer hover:underline-offset-1 transition-colors duration-300'>
                Services
            </li>
            <li className='text-md font-extralight hover:text-[#FA5F55] cursor-pointer hover:underline-offset-1 transition-colors duration-300'>Features</li>
            <li className='text-md font-extralight hover:text-[#FA5F55] cursor-pointer hover:underline-offset-1 transition-colors duration-300'>How It Works</li>
            <li className='text-md font-extralight hover:text-[#FA5F55] cursor-pointer hover:underline-offset-1 transition-colors duration-300'>Pricing</li>
            <li className='text-md font-extralight hover:text-[#FA5F55] cursor-pointer hover:underline-offset-1 transition-colors duration-300'>Contact</li>
        </ul>
      </div>

      <div className='flex gap-4'>
        <Link href="/login" className='border-1 border-[#FA5F55]/30 rounded-full px-6 py-4 bg-transparent text-gray-900 font-normal hover:bg-[#FA5F55] hover:text-white cursor-pointer transition-all duration-300'>
            Login
        </Link>
        <Link href="/register" className='border-1 border-[#FA5F55] rounded-full px-6 py-4 bg-[#1f1e24] text-white font-normal hover:bg-[#FA5F55]/90 cursor-pointer transition-all duration-300'>
            SignUp
        </Link>
      </div>
    </div>
  )
}

export default Navbar
