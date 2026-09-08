"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const AvatarScene = dynamic(() => import("@/components/avatar-scene").then((module) => module.AvatarScene), { ssr: false });

export function AvatarStage() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const frame = window.requestAnimationFrame(() => {
      setSupported(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return <div className="avatar-stage" aria-hidden="true">{supported ? <AvatarScene /> : <div className="avatar-orb" />}</div>;
}
