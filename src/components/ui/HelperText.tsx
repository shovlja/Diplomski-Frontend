import * as React from "react";

export function HelperText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-sm text-gray-500">{children}</p>;
}
