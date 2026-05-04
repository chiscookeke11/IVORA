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
    const end = (index + 1) / total

    const opacity = useTransform(
        progress,
        [start, (start + end) / 2, end],
        [0.1, 0.5, 1]
    )

    return (
        <motion.span className="text-white" style={{ opacity }}>
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

    const text = `Where voice is not just heard but interpreted, processed and resolved in realtime.By combining AI with telecom infrastructure.\n\nWe are eliminating delays reducing friction, and redefining how users connect with services.\n\nThis is not just automation, it's intelligent interaction.`

    const words = text.split(/\s+/).filter(Boolean)
    const lineBreakPositions = Array.from(text.matchAll(/\n+/g)).map(match => {
        const wordsBeforeBreak = text
            .slice(0, match.index)
            .trim()
            .split(/\s+/)
            .filter(Boolean).length
        return {
            index: wordsBeforeBreak,
            breaks: match[0].length,
        }
    })

    return (
        <section
            id="believe"
            ref={ref}
            className="py-28 px-[5%] flex items-center justify-center font-sans"
        >
            <p className="text-lg md:text-4xl max-w-3xl">
                We see a world where every call is understood instantly.
                <br />
                <br />

                {words.map((word, i) => {
                    const breakAfterWord = lineBreakPositions.find(item => item.index === i + 1)

                    return (
                        <span key={i}>
                            <Word
                                word={word}
                                index={i}
                                total={words.length}
                                progress={scrollYProgress}
                            />
                            {breakAfterWord &&
                                Array.from({ length: breakAfterWord.breaks }).map((_, breakIndex) => (
                                    <br key={`break-${i}-${breakIndex}`} />
                                ))}
                        </span>
                    )
                })}
            </p>
        </section>
    )
}
