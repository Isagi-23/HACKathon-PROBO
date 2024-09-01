import React from "react";
import { Skeleton } from "../ui/skeleton";

interface LoaderProps {
  count: number;
  width?: string;
  height?: string;
}

const PollLoader: React.FC<LoaderProps> = ({
  count,
  width = "200px",
  height = "200px",
}) => {
  const skeletons = Array.from({ length: count }).map((_, i) => (
    <Skeleton
      key={i}
      className="bg-gray-200 animate-pulse"
      style={{ width, height }}
    />
  ));

  return (
    <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 min-w-md">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className="bg-gray-200 animate-pulse rounded-md"
          style={{ width, height }}
        />
      ))}
    </div>
  );
};

export default PollLoader;
