"use client"
import { motion, MotionValue, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"


type WordProps = {
    word: string
    index: number
    total: number
    progress: MotionValue<number>
}


const Word = ({ word, index, total, progress }: WordProps) => {
    const start = index / total
    const end = start + 0.2

    const opacity = useTransform(
        progress,
        [start, (start + end) / 2, end],
        ["10%", "50%", "100%"]
    )

    return (
        <motion.span className="text-white" style={{ opacity}}>
            {" "}{word}
        </motion.span>
    )
}

export default function BelieveSection() {
    const ref = useRef(null)

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 0.8", "end 0.8"],
    })

    const text = `Where voice is not just heard but interpreted, processed and resolved in realtime. By combining AI with telecom infrastructure. We are eliminating delays reducing friction, and redefining how users connect with services. This is not just automation, it's intelligent interaction.`

    const words = text.split(" ")

    return (
        <section
            ref={ref}
            className="py-28 px-[3%] flex items-center justify-center font-sans"
        >
            <p className="text-lg md:text-4xl max-w-3xl">
                We see a world where every call is understood instantly.

                {words.map((word, i) => (
                    <Word
                        key={i}
                        word={word}
                        index={i}
                        total={words.length}
                        progress={scrollYProgress}
                    />
                ))}
            </p>
        </section>
    )
}