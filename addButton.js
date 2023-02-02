export const addButton = (txt, position, onClick, scl) => {
    const btn = add([
        text(txt, {
            font: "duster"
        }),
        pos(position),
        area({ cursor: "pointer" }),
        scale(scl ?? 1),
    ])

    btn.onClick(onClick)

    return btn
}