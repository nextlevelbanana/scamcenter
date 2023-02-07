import { black, red, cyan } from "./colors"
import { fontSize } from "./constants"



export const createConsequence = () => {
    //status: deck | hand | inPlay | discard | potential

    loadSprite("cardBackground", "./assets/sprites/cards/CardBase.png")

    const consequences = [
        "gotcha journalism",
        "cyberbacklash",
        "lawsuit",
        "fines",
        "restraining order"
    ]

    const newCard = add([
        "card",
        "hasInfoText",
        "consequences",
        {kind: "consequences"},
        "discard",
        rect(48,48),
        opacity(0),
        area(),
        scale(2),
        z(50),
        pos(width()*2, height()*2)
    ])

    newCard.add([
        sprite("cardBackground"),
        "cardBackground",
        pos(0, -10),
        color(Color.fromHex(red))
    ])

    newCard.add([
        "cardName",
        "cardText",
        color(Color.fromHex(black)),
        text(choose(consequences), {
            size: fontSize.sm,
            font: "duster",
        }),
        pos(4, 43),
        scale(0.5)
    ])
    newCard.add([
        "cardKind",
        "cardText",
        color(Color.fromHex(black)),
        text("consequences", {
            size: fontSize.sm,
            font: "duster",
        }),
        pos(4, 54),
        scale(0.5)
    ])

    return newCard
}