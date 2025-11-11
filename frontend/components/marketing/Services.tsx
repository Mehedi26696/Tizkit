"use client";
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
    title: 'Write faster',
    desc: 'Smart snippets, templates, and linting help you focus on content—not curly braces.',
  },
  {
    icon: <Terminal className="h-6 w-6" />,
    title: 'See it live',
    desc: 'Instant preview and quick compile keep your flow unbroken.',
  },
  {
    icon: <Paintbrush className="h-6 w-6" />,
    title: 'Organize & collaborate',
    desc: 'Projects, folders, and share links so teammates can review without installing anything.',
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    title: 'Seamless export',
    desc: 'Consistent, publication-ready PDFs and BibTeX management in one place.',
  },
];
export default function Feature1() {
  return (
    <section className="relative py-14">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="relative mx-auto max-w-2xl sm:text-center">
          <div className="relative z-10">
            <h3 className="mt-4 text-5xl font-normal tracking-tighter sm:text-4xl md:text-5xl font-helvetica">
              Our <span className='text-orange-500'>Services</span>
            </h3>
            
          </div>
          <div
            className="absolute inset-0 mx-auto h-44 max-w-xs blur-[118px]"
            style={{
              background:
                'linear-gradient(152.92deg, rgba(255, 149, 0, 0.2) 4.54%, rgba(255, 140, 0, 0.26) 34.2%, rgba(255, 149, 0, 0.1) 77.55%)',
            }}
          ></div>
        </div>
        <hr className="bg-orange-400/30 mx-auto mt-5 h-px w-1/2" />
        <div className="relative mt-12">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {features.map((item, idx) => (
              <li
                key={idx}
                className="transform-gpu space-y-3 rounded-xl border bg-transparent p-4 [box-shadow:0_-20px_80px_-20px_#ff950030_inset]"
              >
                <div className="text-orange-500 w-fit transform-gpu rounded-full border border-orange-500/30 p-4 [box-shadow:0_-20px_80px_-20px_#ff950040_inset] dark:[box-shadow:0_-20px_80px_-20px_#ff950020_inset]">
                  {item.icon}
                </div>
                <h4 className="font-[helvetica] text-lg font-bold tracking-tighter">
                  {item.title}
                </h4>
                <p className="text-gray-500">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
