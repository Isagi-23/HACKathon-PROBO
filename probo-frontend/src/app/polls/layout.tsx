import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container flex items-center justify-center mx-auto p-4 space-y-6">
      {children}
    </div>
  );
};

export default layout;
