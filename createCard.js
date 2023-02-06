import { black, white, cyan } from "./colors"
import { fontSize } from "./constants"

export const createCard = (data, status) => {
    //status: deck | hand | inPlay | discard | potential
    //kind: grifts | frauds | propups | specials

    loadSprite("cardBackground", "./assets/sprites/cards/CardBase.png")

    const newCard = add([
        data,   
        "card",
        status, //tag
        data.kind, //tag
        sprite("cardBackground"),
        area(),
        scale(2),
        z(50)
    ])

    if (typeof data.artwork === "string") {
        
        loadSprite(`cardArt_${data.artwork}`, `./assets/sprites/cards/${data.artwork}.png`)

        newCard.add([
            "cardArt",
            sprite(`cardArt_${data.artwork}`),
            pos(0,4)
        ])
    }

    newCard.add([
        "cardName",
        color(black),
        text(data.name, {
            size: fontSize.sm,
            font: "duster",
        }),
        pos(4, 54),
        scale(0.5)
    ])
    newCard.add([
        "cardKind",
        color(black),
        text(data.kind, {
            size: fontSize.sm,
            font: "duster",
        }),
        pos(4, 62),
        scale(0.5)
    ])

    if(newCard.is("grifts")) {
        newCard.add([
            "suckerCountUI",
            text(`suckers: ${data.suckers ?? 0}`, {
                size: fontSize.sm,
                font: "duster"
            }),
            pos(4, 72),
            scale(0.5)

        ])
        newCard.add([
            "phaseUI",
            color(cyan),
            pos(4, 68),
            text("test")
        ])
        newCard.get("phaseUI")[0].hidden = true
    }

    if(newCard.is("frauds")) {
        newCard.add([
            "fraudUI",
            color(200, 178, 28),
            text(data.amount, {
                size: fontSize.sm,
                font: "duster",
                scale: 1
            }),
            pos(4, 72),
            scale(0.5)
        ])
    }
    return newCard
}