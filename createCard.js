import { black, white, cyan } from "./colors"

export const createCard = (data, status) => {
    //status: deck | hand | inPlay | discard
    //kind: grifts | frauds | propups | specials

    loadSprite("cardBackground", "./assets/sprites/cards/CardBase.png")

    const newCard = add([
        data,   
        "card",
        status, //tag
        data.kind, //tag
        sprite("placeholder"),
        area()
        //todo: does it need an initial position?
    ])

    newCard.add([
        "cardBackground",
        sprite("cardBackground"),
        scale(4),
        pos(0,-10)
    ])

    if (typeof data.artwork === "string") {
        
        loadSprite(`cardArt_${data.artwork}`, `./assets/sprites/cards/${data.artwork}.png`)

        newCard.add([
            "cardArt",
            sprite(`cardArt_${data.artwork}`),
            scale(4),
            pos(0,9)
        ])
    }

    newCard.add([
        "cardName",
        color(black),
        text(data.name, {
            size: 24
        }),
        pos(6, 200)
    ])

    if(newCard.is("grifts")) {
        newCard.add([
            "suckerCountUI",
            color(white),
            text(`suckers: ${data.suckers ?? 0}`, {
                size: 24
            }),
            pos(0, 0)
        ])
        newCard.add([
            "phaseUI",
            color(cyan),
            pos(0, 28),
            text("test")
        ])
        newCard.get("phaseUI")[0].hidden = true
    }

    return newCard
}