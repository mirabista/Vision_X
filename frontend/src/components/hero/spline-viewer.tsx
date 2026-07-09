"use client";

import { memo } from "react";

interface Props {
  title?: string;
}

function SplineViewer({
  title = "VisionX Hero Background",
}: Props) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <iframe
        src="https://my.spline.design/web3agencysaasherosection-RktRAjJJRuJBIG1uWm6xKFEk/"
        title={title}
        className="w-full h-full border-0"
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}

export default memo(SplineViewer);