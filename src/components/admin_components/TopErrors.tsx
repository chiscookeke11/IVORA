"use client"


import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions,
} from "chart.js"

import { Bar } from "react-chartjs-2"

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

export default function TopErrors({ labels, data }: { labels: string[], data: number[] }) {
    const barChartData = {
        labels: labels,
        datasets: [
            {
                label: "Top Errors",
                data: data,
                borderColor: "#3B82F6",
                backgroundColor: "#3B82F6",
                tension: 0.4,
                fill: true,
                borderRadius: 5,
                pointBackgroundColor: "#8b5cf6",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 20,
                pointHoverRadius: 20,
                hoverBackgroundColor: "#3b82f6",
                hoverBorderColor: "#1d4ed8",
            },
        ],
    }

    const barChartOptions: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "#ffffff",
                titleColor: "#8b6a2b",
                bodyColor: "#8b6a2b",
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                titleFont: {
                    family: "space grotesk",
                    size: 14,
                },
                bodyFont: {
                    family: "space grotesk",
                    size: 12,
                },
                callbacks: {
                    label: (context) => {
                        if (context.parsed.y != null) {
                            return `${context.parsed.y} Error${context.parsed.y > 1 ? "s" : ""} `;
                        }
                        return "";
                    },
                },
            },
        },
        scales: {
            x: {
                border: {
                    display: false,
                },
                grid: {
                    color: "transparent",
                },
                ticks: {
                    color: "#94A3B8",
                    font: {
                        family: "space grotesk",
                        size: 15,
                    },
                },
            },
            y: {
                border: {
                    display: false,
                },
                grid: {
                    color: "transparent",
                },
                ticks: {
                    color: "#94A3B8",
                    font: {
                        family: "space grotesk",
                        size: 15,
                    },
                },
            },
        },
        interaction: {
            mode: "index" as const,
            intersect: false,
        },
        elements: {
            line: {
                borderWidth: 3,
            },
        },
    }


    return (
        <div className="w-full h-full col-span-2 border border-[#1E293B] bg-[#0A0A0FCC] py-7 px-4 rounded-xl flex flex-col items-start justify-between gap-12">
            <div className="w-full flex items-center justify-between gap-6 " >
                <h3 className="font-medium text-lg text-[#F8FAFC] " >Top Error Codes (This Week)</h3>

                <span className="bg-[#171720] py-2 px-3.5 flex items-center justify-center text-center
rounded-[99999px]  text-xs font-medium text-[#F8FAFC] border border-[#1E293B]
                "  >
                    All Providers
                </span>
            </div>

            <div className="w-full h-fit min-h-[250px]" >
                {labels.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">No error data available</div>
                ) : (
                    <Bar data={barChartData} options={barChartOptions} />
                )}
            </div>
        </div>
    )
}