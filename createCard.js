import { black, green, cyan, dark } from "./colors"
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
        rect(48,48),
        opacity(0),
        area(),
        scale(2),
        z(50)
    ])

    newCard.add([
        sprite("cardBackground"),
        "cardBackground",
        pos(0, -10)
    ])

    if (typeof data.artwork === "string") {
        
        loadSprite(`cardArt_${data.artwork}`, `./assets/sprites/cards/${data.artwork}.png`)

        newCard.add([
            "cardArt",
            area(),
            sprite(`cardArt_${data.artwork}`),
            pos(0,-5)
        ])
    } else {
        loadSprite("propup", "./assets/sprites/icon_propup.png")
        loadSprite("fraud", "./assets/sprites/icon_money.png")

        if (newCard.kind === "propups" || newCard.kind === "frauds") {
            newCard.add([
                "cardArt",
                sprite(newCard.kind.substring(0, newCard.kind.length - 1)),
                pos(15,12)
            ])
        }
    }

    newCard.add([
        "cardName",
        "cardText",
        color(Color.fromHex(black)),
        text(data.name, {
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
        text(data.kind, {
            size: fontSize.sm,
            font: "duster",
        }),
        pos(4, 54),
        scale(0.5)
    ])

    if(newCard.is("grifts")) {
        newCard.add([
            "cardText",
            sprite("sucker"),
            pos(2,60),
            scale(0.5)
        ])
        newCard.add([
            "suckerCountUI",
            "cardText",
            text(`${data.curve?.join("/")}`, {
                size: fontSize.sm,
                font: "duster",
            }),
            pos(14, 62),
            scale(0.5),
            color(Color.fromHex(cyan))

        ])
        const phaseBar = newCard.add([
            "phaseBar",
            sprite("phaseBar"),
            pos(0, -10),
        ])
        phaseBar.hidden = true
        const dot = phaseBar.add([
            "dot",
            sprite("dot"),
            pos(5,2)
        ])
        dot.hidden = true
    }

    if(newCard.is("frauds")) {
        newCard.add([
            "cardText",
            sprite("moneyIcon"),
            pos(2,60),
            scale(0.5)
        ])
        newCard.add([
            "fraudUI",
            "cardText",
            color(Color.fromHex(green)),
            text(data.amount, {
                size: fontSize.sm,
                font: "duster"
        }),
            pos(14, 62),
            scale(0.5),

        ])
    }

    if(newCard.is("propups")) {
        const [icon, offsetX, offsetY] = data.affects == "curve" ? ["phaseBar", 28, 60] : ["sucker", 14, 62]
        newCard.add([
            "cardText",
            sprite(icon),
            pos(2,60),
            scale(0.5)
        ])
        newCard.add([
            "propupUI",
            "cardText",
            color(Color.fromHex(green)),
            text(data.value, {
                size: fontSize.sm,
                font: "duster"
        }),
            pos(offsetX, offsetY),
            scale(0.5),

        ])
    }

    if (data.description) {
    newCard.add([
        "description",
        "cardText",
        text(data.description, {
            size: fontSize.xs,
            font: "duster",
            width: 44
        }),
        pos(3, newCard.is("propups") && data.affects == "curve" ? 66 : 70),
        color(Color.fromHex(dark))
    ])
}


    return newCard
}