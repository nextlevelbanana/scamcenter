export const addCredit = (name, role, link, i) => {
    add([
        text(name, {
            size: 72,
            font: "duster"
        }),
        color(0,0,0),
        pos(vec2(100, 300*i + 10))
    ])

    add([
        text(role, {
            size: 36,
            font: "duster"
        }),
        color(0,0,0),
        pos(vec2(100, 300*i + 90))
    ])
}