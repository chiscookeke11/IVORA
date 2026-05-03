"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function BelieveSection() {
  const ref = useRef(null);

  // track scroll progress of THIS section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });

  // map scroll → color
  const color = useTransform(
    scrollYProgress,
    [0, 1],
    ["#6b7280", "#ffffff"] // gray → white
  );

  return (
    <section ref={ref} className="py-20 px-[3%]">
      <motion.p
        style={{ color }}
        className="text-lg md:text-xl font-sans leading-relaxed max-w-3xl"
      >
        We see a world where every call is understood instantly. Where voice is
        not just heard but interpreted, processed and resolved in real-time.
        <br />
        <br />
        By combining AI with telecom infrastructure, we are eliminating delays,
        reducing friction, and redefining how users connect with services.
        <br />
        <br />
        This is not just automation — it's intelligent interaction.
      </motion.p>
    </section>
  );
}