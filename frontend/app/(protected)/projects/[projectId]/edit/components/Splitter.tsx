import React from "react";


interface SplitterProps {
  children: React.ReactNode;
  className?: string;
  direction?: "horizontal" | "vertical";
}

// Simple flex-based Splitter component for layout
const Splitter: React.FC<SplitterProps> = ({
  children,
  className = "",
  direction = "horizontal",
}) => {
  return (
    <div
      className={
        `flex ${direction === "horizontal" ? "flex-row" : "flex-col"} w-full h-full ` + className
      }
    >
      {children}
    </div>
  );
};

export default Splitter;
