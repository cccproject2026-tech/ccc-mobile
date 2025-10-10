export const convertColor = (hex: string, opacity: number): string => {
    const cleanedHex = hex.replace("#", "")

    const fullHex = cleanedHex.length === 3
        ? cleanedHex.split("").map(c => c + c).join("")
        : cleanedHex;

    const r = parseInt(fullHex.substring(0, 2), 16)
    const g = parseInt(fullHex.substring(2, 4), 16)
    const b = parseInt(fullHex.substring(4, 6), 16)

    return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
