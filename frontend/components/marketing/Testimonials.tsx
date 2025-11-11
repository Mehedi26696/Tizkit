'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Marquee } from '@/components/ui/marquee';

export function Highlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'bg-orange-500/10 p-1 py-0.5 font-bold text-orange-500',
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface TestimonialCardProps {
  name: string;
  role: string;
  img?: string;
  description: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export function TestimonialCard({
  description,
  name,
  img,
  role,
  className,
  ...props // Capture the rest of the props
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        'mb-4 flex w-full cursor-pointer break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl p-4',
        // theme styles
        'border-border bg-card/50 border shadow-sm',
        // hover effect
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
      {...props}
    >
      <div className="text-muted-foreground text-sm font-normal select-none">
        {description}
        <div className="flex flex-row py-1">
          <Star className="size-4 fill-orange-500 text-orange-500" />
          <Star className="size-4 fill-orange-500 text-orange-500" />
          <Star className="size-4 fill-orange-500 text-orange-500" />
          <Star className="size-4 fill-orange-500 text-orange-500" />
          <Star className="size-4 fill-orange-500 text-orange-500" />
        </div>
      </div>

      <div className="flex w-full items-center justify-start gap-5 select-none">
        <img
          width={40}
          height={40}
          src={img || ''}
          alt={name}
          className="size-10 rounded-full ring-1 ring-orange-500/20 ring-offset-2"
        />

        <div>
          <p className="text-foreground font-medium">{name}</p>
          <p className="text-muted-foreground text-xs font-normal">{role}</p>
        </div>
      </div>
    </div>
  );
}
const testimonials = [
  {
    name: 'H.M. Mehedi Hasan',
    role: 'Full-Stack Developer',
    img: 'https://avatars.githubusercontent.com/u/141162383?v=4',
    description: (
      <p>
        Building Tikzit was an incredible journey combining my passion for LaTeX and web development.
        <Highlight>
          The AI-powered editor makes creating complex diagrams feel effortless.
        </Highlight>{' '}
        I&apos;m excited to see how it helps students and researchers worldwide.
      </p>
    ),
  },
  {
    name: 'Abu Bakar Siddique',
    role: 'Frontend Developer',
    img: 'https://avatars.githubusercontent.com/u/140780598?v=4',
    description: (
      <p>
        Designing the visual workspace was a challenge I loved tackling.
        <Highlight>
          The drag-and-drop interface makes TikZ accessible to everyone.
        </Highlight>{' '}
        Seeing users create beautiful diagrams in minutes is incredibly rewarding.
      </p>
    ),
  },
  {
    name: 'Ahil Islam Aurnob',
    role: 'Backend Developer',
    img: 'https://avatars.githubusercontent.com/u/66911551?v=4',
    description: (
      <p>
        Optimizing the cloud compilation engine was the most exciting part for me.
        <Highlight>
          Real-time LaTeX rendering with error detection feels like magic.
        </Highlight>{' '}
        The backend infrastructure scales beautifully for thousands of concurrent users.
      </p>
    ),
  },
  {
    name: 'Farhan Bin Rabbani',
    role: 'QA & Analytics',
    img: 'https://avatars.githubusercontent.com/u/167717462?v=4',
    description: (
      <p>
        Ensuring Tikzit works flawlessly across all scenarios was my mission.
        <Highlight>
          Our testing framework catches edge cases that would break most LaTeX editors.
        </Highlight>{' '}
        The analytics show users are 5x more productive than with traditional tools.
      </p>
    ),
  },
  {
    name: 'Amio Rashid',
    role: 'Research Scientist at Japan 🇯🇵',
    img: 'https://avatars.githubusercontent.com/u/128881150?v=4',
    description: (
      <p>
        Tikzit has revolutionized how I create diagrams for my research papers.
        <Highlight>
          What used to take hours of TikZ coding now takes minutes with the visual editor.
        </Highlight>{' '}
        The instant preview is a game-changer.
      </p>
    ),
  },
  {
    name: 'Marcus Johnson',
    role: 'PhD Candidate, Computer Science',
    img: 'https://randomuser.me/api/portraits/men/22.jpg',
    description: (
      <p>
        I was drowning in LaTeX compilation errors before Tikzit.
        <Highlight>
          The error console with auto-fix suggestions saved my thesis defense.
        </Highlight>{' '}
        It&apos;s like having a LaTeX expert looking over your shoulder.
      </p>
    ),
  },
  {
    name: 'Prof. Elena Rodrigo',
    role: 'Mathematics Department Head',
    img: 'https://randomuser.me/api/portraits/women/44.jpg',
    description: (
      <p>
        Teaching LaTeX to students was always challenging.
        <Highlight>
          Tikzit&apos;s template library gets them writing papers in minutes, not weeks.
        </Highlight>{' '}
        The learning curve has completely disappeared.
      </p>
    ),
  },
  {
    name: 'Alex Kumar',
    role: 'Technical Writer at ArXiv',
    img: 'https://randomuser.me/api/portraits/men/32.jpg',
    description: (
      <p>
        As someone who publishes multiple papers a month, Tikzit is essential.
        <Highlight>
          The versioning system lets me experiment with diagrams without fear.
        </Highlight>{' '}
        I can always roll back to previous versions.
      </p>
    ),
  },
  {
    name: 'Dr. Yuki Tanaka',
    role: 'Quantum Physics Researcher',
    img: 'https://randomuser.me/api/portraits/men/55.jpg',
    description: (
      <p>
        Creating complex quantum circuit diagrams used to be painful.
        <Highlight>
          Tikzit&apos;s visual workspace made it intuitive—drag, drop, done.
        </Highlight>{' '}
        My collaborators love the view-only sharing links too.
      </p>
    ),
  },
  {
    name: 'Priya Patel',
    role: 'Graduate Student, Engineering',
    img: 'https://randomuser.me/api/portraits/women/67.jpg',
    description: (
      <p>
        I needed professional-looking diagrams for my thesis on a tight budget.
        <Highlight>
          The free plan with daily credits is perfect for students.
        </Highlight>{' '}
        No expensive software licenses required!
      </p>
    ),
  },
  {
    name: 'James O&apos;Brien',
    role: 'Senior Lecturer, Statistics',
    img: 'https://randomuser.me/api/portraits/men/78.jpg',
    description: (
      <p>
        I import my old .tex projects into Tikzit without any issues.
        <Highlight>
          It preserves everything perfectly and makes editing so much easier.
        </Highlight>{' '}
        The PDF and SVG export options are incredibly useful.
      </p>
    ),
  },
  {
    name: 'Fatima Al-Rahman',
    role: 'Postdoc in Applied Mathematics',
    img: 'https://randomuser.me/api/portraits/women/89.jpg',
    description: (
      <p>
        No more installing LaTeX distributions on every computer I use.
        <Highlight>
          Everything runs in the browser with cloud compilation—it just works.
        </Highlight>{' '}
        I can work from anywhere with an internet connection.
      </p>
    ),
  },
  {
    name: 'David Park',
    role: 'Algorithm Researcher',
    img: 'https://randomuser.me/api/portraits/men/92.jpg',
    description: (
      <p>
        Managing paper submissions with consistent formatting was a nightmare.
        <Highlight>
          Tikzit&apos;s template library ensures everyone follows our conference style.
        </Highlight>{' '}
        Submission quality has improved dramatically.
      </p>
    ),
  },
];

export default function Testimonials() {
  return (
    <section className="relative container py-10">
      {/* Decorative elements */}
      <div className="absolute top-20 -left-20 z-10 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl" />
      <div className="absolute -right-20 bottom-20 z-10 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className=" font-helvetica text-foreground mb-4 text-center text-4xl leading-[1.2] font-normal tracking-tighter md:text-5xl">
          What <span className="text-orange-500">Our Users </span>Are Saying
        </h2>
        <h3 className="text-muted-foreground mx-auto mb-8 max-w-lg text-center text-lg font-medium tracking-tight text-balance">
          Don&apos;t just take our word for it. Here&apos;s what{' '}
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            researchers and academics
          </span>{' '}
          are saying about{' '}
          <span className="font-semibold text-orange-500">Tikzit</span>
        </h3>
      </motion.div>

      <div className="relative mt-6 max-h-screen overflow-hidden">
        <div className="gap-4 md:columns-2 xl:columns-3 2xl:columns-4">
          {Array(Math.ceil(testimonials.length / 3))
            .fill(0)
            .map((_, i) => (
              <Marquee
                vertical
                key={i}
                className={cn({
                  '[--duration:60s]': i === 1,
                  '[--duration:30s]': i === 2,
                  '[--duration:70s]': i === 3,
                })}
              >
                {testimonials.slice(i * 3, (i + 1) * 3).map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: Math.random() * 0.8,
                      duration: 1.2,
                    }}
                  >
                    <TestimonialCard {...card} />
                  </motion.div>
                ))}
              </Marquee>
            ))}
        </div>
        <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full bg-gradient-to-t from-20%"></div>
        <div className="from-background pointer-events-none absolute inset-x-0 top-0 h-1/4 w-full bg-gradient-to-b from-20%"></div>
      </div>
    </section>
  );
}

