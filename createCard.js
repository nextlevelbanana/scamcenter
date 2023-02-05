import { black, white, cyan } from "./colors"

export const createCard = (data, status) => {
    //status: deck | hand | inPlay | discard
    //kind: grifts | frauds | propups | specials

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
        "cardName",
        color(black),
        text(data.name, {
            size: 24
        }),
        pos(0, -40)
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