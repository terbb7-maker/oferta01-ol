"use client";

import { useEffect } from "react";
import { initializeTikTokPixel } from "@/lib/tiktok";

export function TikTokPixel() {
  useEffect(() => {
    initializeTikTokPixel();
  }, []);

  return null;
}
