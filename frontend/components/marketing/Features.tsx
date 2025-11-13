// Features component
"use client"
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";

export function Features() {
  const features = [
    {
      title: "AI-Powered Editor",
      description:
        "Generate TikZ diagrams, tables, and clean LaTeX blocks in seconds—guided by natural language with auto-fix for common issues.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-3 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Visual Workspace",
      description:
        "Drag nodes, anchors, and grids with pixel-perfect snapping. Design visually while Tikzit writes the LaTeX for you.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-3 dark:border-neutral-800",
    },
    {
      title: "Instant Preview",
      description:
        "Low-latency compile with cursor sync—see exactly what changes without leaving your flow.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-2 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Error Console",
      description:
        "Readable, actionable diagnostics with one-click suggestions to resolve syntax and package issues.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-2 border-b dark:border-neutral-800",
    },
    {
      title: "Template Library",
      description:
        "Thesis, conference paper, resume/CV, posters, and Beamer slides—publish-ready starting points.",
      skeleton: <SkeletonOne />,
      className: "col-span-1 lg:col-span-2 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Versioning & Restore",
      description:
        "Snapshot your progress, browse a timeline of changes, and restore confidently when you experiment.",
      skeleton: <SkeletonTwo />,
      className: "col-span-1 lg:col-span-2 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Share & Permissions",
      description:
        "Share view-only links today; live co-editing with roles and presence is coming soon.",
      skeleton: <SkeletonThree />,
      className: "col-span-1 lg:col-span-2 border-b dark:border-neutral-800",
    },
    {
      title: "Rich Export",
      description:
        "Export pristine PDF, SVG, PNG, or full .tex bundles—including assets—for journal or archive.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 lg:border-none",
    },
  ];

  return (
    <div className="py-10 lg:py-40 mx-auto bg-[#f5f3ef]">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
          The smarter way to work with LaTeX
        </h4>

        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
          From TikZ to tables—AI assistance, visual design, and instant preview so you can stay in flow and ship beautiful PDFs.
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md dark:border-neutral-800">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("p-4 sm:p-8 relative overflow-hidden", className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl mx-auto text-left tracking-tight text-black dark:text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-neutral-500 font-normal dark:text-neutral-300",
        "max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <div className="flex py-8 px-2 gap-10 bg-black">
      <div className="w-full p-5 mx-auto shadow-2xl group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2">
          {/* Placeholder for AI editor showcase */}
          <div className="h-full w-full aspect-square bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-sm flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-orange-600 dark:text-orange-400 font-semibold">AI-Powered LaTeX</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Generate clean diagrams & tables</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 z-10 inset-x-0 h-60 bg-gradient-to-t from-white dark:from-black via-white dark:via-black to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-10 inset-x-0 h-60 bg-gradient-to-b from-white dark:from-black via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <a
      href="https://www.youtube.com/watch?v=RPa3_AD1_Vs"
      target="__blank"
      className="relative flex gap-10 h-full group/image"
      aria-label="Watch product preview on YouTube"
    >
      <div className="w-full mx-auto bg-transparent dark:bg-transparent group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2 relative">
          <IconBrandYoutubeFilled className="h-20 w-20 absolute z-10 inset-0 text-red-500 m-auto" />
          <img
            src="https://assets.aceternity.com/fireship.jpg"
            alt="Video preview thumbnail"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-center rounded-sm blur-none group-hover/image:blur-md transition-all duration-200"
          />
        </div>
      </div>
    </a>
  );
};

export const SkeletonTwo = () => {
  const images = [
    "https://images.unsplash.com/photo-1517322048670-4fba75cbbb62?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1573790387438-4da905039392?q=80&w=3425&auto=format&fit=crop&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1555400038-63f5ba517a47?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1554931670-4ebfabf6e7a9?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1546484475-7f7bd55792da?q=80&w=2581&auto=format&fit=crop&ixlib=rb-4.0.3",
  ];

  const imageVariants = {
    whileHover: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
    whileTap: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
  };

  return (
    <div className="relative flex flex-col items-start p-8 gap-10 h-full overflow-hidden">
      <div className="flex flex-row -ml-20">
        {images.map((image, idx) => (
          <motion.div
            variants={imageVariants}
            key={"images-first" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 shrink-0 overflow-hidden"
          >
            <img
              src={image}
              alt="Workspace preview"
              width={500}
              height={500}
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </div>
      <div className="flex flex-row">
        {images.map((image, idx) => (
          <motion.div
            key={"images-second" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            variants={imageVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 shrink-0 overflow-hidden"
          >
            <img
              src={image}
              alt="Workspace preview"
              width={500}
              height={500}
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </div>

      <div className="absolute left-0 z-10 inset-y-0 w-20 bg-gradient-to-r from-white dark:from-black to-transparent h-full pointer-events-none" />
      <div className="absolute right-0 z-10 inset-y-0 w-20 bg-gradient-to-l from-white dark:from-black to-transparent h-full pointer-events-none" />
    </div>
  );
};

export const SkeletonFour = () => {
  return (
    <div className="h-60 md:h-60 flex flex-col items-center relative bg-transparent dark:bg-transparent mt-10">
      {/* Placeholder for feature visualization */}
    </div>
  );
};

 
