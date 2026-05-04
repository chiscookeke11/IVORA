"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion"
import Button from "./UI/Button"
import { features_data } from "@/data/features_data"
import { features_data_type } from "@/types/types"

interface CardProps {
    data: features_data_type
}

const Card = ({ data }: CardProps) => {
    return (
        <div className="w-full h-fit flex flex-col items-start gap-5 rounded-2xl  p-2">
            <h2 className="font-sans text-2xl font-semibold tracking-wide text-white  " >{data.title}</h2>
            <p className="text-lg text-white/60 font-normal tracking-wide max-w-xl " >{data.content}</p>
            <Button variant="gray" onClick={() => alert("Clicked!")}>Learn more</Button>
        </div>
    )
}

const featureImages = [
    "/globe.svg",
    "/window.svg",
    "/file.svg",
    "/next.svg",
    "/vercel.svg",
    "/1763960275228.jpg",
]

export default function Features() {
    const targetRef = useRef<HTMLDivElement>(null)
    const [activeIndex, setActiveIndex] = useState(0)

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"],
    })

    const y = useTransform(scrollYProgress, [0, 1], ["8%", "-75%"])
    const indexProgress = useTransform(scrollYProgress, [0, 1], [0, features_data.length - 1])

    useMotionValueEvent(indexProgress, "change", (latest) => {
        const nextIndex = Math.max(0, Math.min(features_data.length - 1, Math.round(latest)))
        setActiveIndex(nextIndex)
    })

    return (
        <section className="my-48 w-full px-[3%] md:px-[4%] flex justify-center">
            <div className="w-full max-w-7xl hidden md:flex flex-row gap-20 lg:gap-32 items-start justify-between">
                {/* left side (scroll text cards) */}
                <div ref={targetRef} className="w-full max-w-3xl relative h-[620vh]">
                    <div className="w-full h-fit sticky top-[10%] max-w-3xl overflow-hidden pt-20 pb-20">
                        <motion.div className="flex flex-col gap-120 h-full" style={{ y }}>
                            {features_data.map((feature, i) => (
                                <Card data={feature} key={i} />
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* right side (fade image switcher) */}
                <div className="sticky top-[18%] w-full max-w-[420px] h-[500px] rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02]">
                    {featureImages.map((img, i) => (
                        <motion.div
                            key={img}
                            className="absolute inset-0"
                            initial={false}
                            animate={{ opacity: i === activeIndex ? 1 : 0 }}
                            transition={{ duration: 0.45, ease: "easeInOut" }}
                        >
                            <Image
                                src={img}
                                alt={features_data[i]?.title ?? `Feature image ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1280px) 33vw, 420px"
                                priority={i === 0}
                            />
                        </motion.div>
                    ))}
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-sm text-white/80">Now viewing</p>
                        <h4 className="text-lg font-semibold">{features_data[activeIndex]?.title}</h4>
                    </div>
                </div>
            </div>
        </section>
    )
}
