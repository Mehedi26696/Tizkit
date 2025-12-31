"use client";
import { motion } from 'framer-motion';
import {
  Code,
  Terminal,
  Paintbrush,
  Rocket,
  Book,
  PlusCircle,
} from 'lucide-react';

const features = [
  {
    icon: <Code className="h-6 w-6" />,
    title: 'Visualize Faster',
    desc: 'Smart snippets, templates, and linting help you focus on content—not curly braces.',
  },
  {
    icon: <Terminal className="h-6 w-6" />,
    title: 'See It Live',
    desc: 'Instant preview and quick compile keep your flow unbroken.',
  },
  {
    icon: <Paintbrush className="h-6 w-6" />,
    title: 'Organize & Collaborate',
    desc: 'Projects, folders, and share links so teammates can review without installing anything.',
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    title: 'Seamless Export',
    desc: 'Consistent, publication-ready PDFs and BibTeX management in one place.',
  },
];

const headerVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { 
    opacity: 1, 
    y: 0,
  },
};

export default function Feature1() {
  return (
    <section id="services" className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        {/* Decorative gradient blobs */}
        <motion.div 
          className="bg-[#FA5F55]/10 absolute -top-10 -left-10 -z-10 h-48 w-48 sm:h-60 sm:w-60 md:h-72 md:w-72 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="bg-[#FA5F55]/10 absolute -bottom-10 -right-10 -z-10 h-48 w-48 sm:h-60 sm:w-60 md:h-72 md:w-72 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />

        <motion.div 
          className="relative mx-auto max-w-2xl text-center mb-8 sm:mb-10 md:mb-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="relative z-10">
            <motion.h2
              variants={headerVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight"
            >
              Our{' '}
              <span className="from-primary bg-gradient-to-r to-[#FA5F55] bg-clip-text text-transparent">
                Services
              </span>
            </motion.h2>
          </div>
          <div
            className="absolute inset-0 mx-auto h-44 max-w-xs blur-[118px]"
            style={{
              background:
                'linear-gradient(152.92deg, rgba(250, 95, 85, 0.2) 4.54%, rgba(250, 95, 85, 0.26) 34.2%, rgba(250, 95, 85, 0.1) 77.55%)',
            }}
          ></div>
        </motion.div>
        
        <motion.hr 
          className="bg-[#FA5F55]/30 mx-auto h-px w-1/2 border-0"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        <div className="relative mt-8 sm:mt-10 md:mt-12">
          <ul className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {features.map((item, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: idx * 0.1,
                  duration: 0.6,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group transform-gpu space-y-3 sm:space-y-4 rounded-xl border border-[#FA5F55]/30 bg-transparent p-4 sm:p-6 backdrop-blur-sm [box-shadow:0_-20px_80px_-20px_#FA5F5530_inset] hover:[box-shadow:0_-20px_80px_-20px_#FA5F5550_inset] transition-all duration-500"
              >
                <motion.div 
                  className="text-[#FA5F55] w-fit transform-gpu rounded-full border border-[#FA5F55]/30 p-3 sm:p-4 [box-shadow:0_-20px_80px_-20px_#FA5F5540_inset] dark:[box-shadow:0_-20px_80px_-20px_#FA5F5520_inset] group-hover:scale-110 transition-transform duration-500"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {item.icon}
                </motion.div>
                <h4 className="font-[helvetica] text-5xl sm:text-7xl font-extralight tracking-tighter group-hover:text-[#FA5F55] transition-colors duration-300">
                  {item.title}
                </h4>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{item.desc}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
