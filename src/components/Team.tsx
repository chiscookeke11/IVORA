"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MemberCard from "./UI/MemberCard";
import { team_members } from "@/data/team_data";


const CARD_WIDTH = 320;
const CARD_GAP = 32;
const STEP_SIZE = CARD_WIDTH + CARD_GAP;

export default function Team() {
    const [activeIndex, setActiveIndex] = useState(0);
    const maxIndex = useMemo(() => Math.max(0, team_members.length - 1), []);

    const scrollLeft = () => setActiveIndex((prev) => Math.max(0, prev - 1));
    const scrollRight = () =>
        setActiveIndex((prev) => Math.min(maxIndex, prev + 1));

    return (
        <section className="my-10 mt-34 md:mt-56 flex w-full flex-col items-center gap-10 pl-[4%] md:pl-[15%]">
            <div className="flex w-full flex-col items-start gap-1 px-6">
                <h2 className="mr-auto max-w-3xl text-center font-sans text-2xl font-semibold md:text-5xl">
                    Meet the Team
                </h2>

                <div className="ml-auto flex w-fit items-center justify-center gap-2 md:mr-[10%]">
                    <button
                        onClick={scrollLeft}
                        disabled={activeIndex === 0}
                        aria-label="View previous team member"
                        className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft size={25} />
                    </button>

                    <button
                        onClick={scrollRight}
                        disabled={activeIndex === maxIndex}
                        aria-label="View next team member"
                        className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronRight size={25} />
                    </button>
                </div>
            </div>

            <div className="w-full overflow-hidden">
                <div
                    className="flex h-fit gap-8 px-4 py-8 transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${activeIndex * STEP_SIZE}px)` }}
                >
                    {team_members.map((member, i) => (
                            <MemberCard key={i} data={member} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}