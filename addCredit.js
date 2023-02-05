import { fontSize, margin } from "./constants"

export const addCredit = (name, role, link, i) => {
    add([
        text(name, {
            size: fontSize.big,
            font: "duster"
        }),
        color(0,0,0),
        pos(vec2(margin, 80*i + 10))
    ])

    add([
        text(role, {
            size: fontSize.med,
            font: "duster"
        }),
        color(0,0,0),
        pos(vec2(margin, 80*i + fontSize.big + 5))
    ])
    add([
        text(link, {
            size: fontSize.med,
            font: "duster"
        }),
        color(0,0,0),
        pos(vec2(margin, 80*i + fontSize.big + 5 + fontSize.med))
    ])
}