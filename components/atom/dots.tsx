"use client"

import * as React from "react"
import { TouchableOpacity, View } from "react-native"

type ProgressDotsProps = {
    total?: number
    activeIndex?: number
    defaultIndex?: number
    onChange?: (index: number) => void
    className?: string
    dotSize?: number
    trackThickness?: number
    wrapperClass?: string
}

export function ProgressDots({
    total = 5,
    activeIndex,
    defaultIndex = 0,
    onChange,
    className,
    dotSize = 14,
    trackThickness = 2,
    wrapperClass = ``
}: ProgressDotsProps) {
    const isControlled = activeIndex !== undefined
    const [index, setIndex] = React.useState(defaultIndex)
    const current = isControlled ? (activeIndex as number) : index

    const handleDotPress = (i: number) => {
        if (!isControlled) {
            setIndex(i)
        }
        onChange?.(i)
    }

    return (
        <View
            role="progressbar"
            aria-label="Progress"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={current + 1}
            className={`relative max-w-[244px] w-full items-center justify-center m-auto ${wrapperClass}`}
            style={{
                height: Math.max(dotSize, trackThickness) + 8,
            }}
        >
            <View
                className="absolute"
                style={{
                    height: trackThickness,
                    backgroundColor: "#194F82",
                    opacity: 0.8,
                    width: "90%",
                    top: "50%",
                    transform: [{ translateY: -trackThickness }],
                }}
            />
            <View
                className="absolute"
                style={{
                    height: trackThickness,
                    backgroundColor: "#ffffff",
                    width: current === 0 ? "0%" : `${(current / (total - 1)) * 90}%`,
                    top: "50%",
                    transform: [{ translateY: -trackThickness }],
                    zIndex: 1,
                    left: "5%",
                }}
            />

            <View
                className="absolute flex-row items-center justify-between"
                style={{
                    width: "90%",
                }}
            >
                {Array.from({ length: total }).map((_, i) => {
                    const isActive = i === current
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => handleDotPress(i)}
                            aria-current={isActive ? "step" : undefined}
                            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-progress-track)]"
                            style={{
                                width: dotSize,
                                height: dotSize,
                                backgroundColor: i <= current ? "#ffffff" : "#1F2937",
                                zIndex: 2,
                            }}
                        />
                    )
                })}
            </View>
        </View>
    )
}

export default ProgressDots