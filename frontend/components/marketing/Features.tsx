"use client"
import { Import } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { CollabBox } from './CollabBox'
import Globe from '../ui/globe'
import { motion } from 'framer-motion'

const ctas = [
  "Live Collaboration",
  "AI Generation",
  "Visual Canvas",
  "Smart Error Fix",
  "Instant Preview",
  "TikZ Autocomplete",
  "One-click Export",
  "Daily Credits"
]

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.5,
    }
  }),
}

function Features() {
  return (
    <section className="w-full py-5 sm:py-8 md:py-12 lg:py-14 mx-auto flex flex-col items-center justify-center bg-[#f5f3ef]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-center text-[#2a2a2a]'>Where precision meets</h1>
        <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-center mb-10 text-[#FA5F55]'>creativity</h1>
      </motion.div>

      <div className="container max-w-5xl px-4 sm:px-6 md:px-8">
        {/* Main feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8">
          <motion.div 
            custom={0}
            variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-[#f9f4eb]/30 border-2 border-gray-500/20 rounded-xl   flex flex-col gap-4 h-78 w-70 relative"
          >
            <div className='absolute top-2 left-1/2 -translate-x-1/2 w-80 h-32 flex justify-center items-center overflow-hidden'>
              <Globe className="scale-75"/>
            </div>
            <div className="p-6 mt-34">
              <h1 className="text-xl font-semibold">AI-Powered Editing</h1>
              <p className="text-sm">Work smarter with an assistant that generates TikZ, tables, and clean LaTeX from natural language—instantly.</p>
            </div>
          </motion.div>

          <motion.div 
            custom={1}
            variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-[#f9f4eb]/30 border-2 border-gray-500/20 rounded-xl p-6  flex flex-col gap-4 h-78 w-70"
          >
            <Image src='/images/diagram.png' width={600} height={500} alt="diagram-builder" className='mx-auto h-30 w-auto object-contain'/>
            <h1 className="text-xl font-semibold">Visual Diagram Builder</h1>
            <p className="text-sm">Drag, drop, and arrange elements while Tikzit writes the code for you.</p>
          </motion.div>

          <motion.div 
            custom={2}
            variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-[#f9f4eb]/30 border-2 border-gray-500/20 rounded-xl p-6  flex flex-col gap-4 h-78 w-70"
          >
            <div className="h-30 flex items-center justify-center">
              <CollabBox/>
            </div>
            <h1 className="text-xl font-semibold">Real-time Collaboration</h1>
            <p className="text-sm">Work together seamlessly with conflict-free, synchronized editing.</p>
          </motion.div>
        </div>

        {/* Feature badges grid */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-1 max-w-2xl mx-auto justify-center items-center'>
          {ctas.map((cta, index) => (
            <motion.div 
              key={cta}
              custom={index + 3}
              variants={fadeInAnimationVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="flex items-center gap-1 bg-[#2a2a2a] text-white px-2 py-3 rounded-lg text-lg justify-center"
            >
              <Image src='/images/star.png' width={30} height={30} alt="star" className=""/>
              <span>{cta}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
