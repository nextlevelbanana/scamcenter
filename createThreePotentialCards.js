import { createCard } from "./createCard"
import { handleCardSelect } from "./handleCardSelect"

export const createThreePotentialCards = async (turn) => {
    const kinds = ["grifts", "frauds", "propups"]
    const kindsData = []
    for(const kind of kinds) {
        let res = await fetch(`./data/${kind}0.json`)
        let json = await res.json()
        kindsData[kind] = json
    }
    for (var i = 0; i < 3; i++) {
        const thisKind = randi(3)
        const cardData = choose(kindsData[kinds[thisKind]])
        cardData.kind = kinds[thisKind]
        const cardObj = createCard(cardData, "potential")
        cardObj.use("potential")
        cardObj.pos = vec2(48 + 128*i, 60)
        cardObj.z = 101

        cardObj.onClick(() => {
            if (turn.state === "addCardToDeck") {
                cardObj.unuse("potential")
                cardObj.use("discard")
                cardObj.z = 1
                cardObj.pos = vec2(width()*2, height() *2) //moving them off screen seems so dumb but if they're hidden they're clickable
                get("potential").forEach(card => {
                    destroy(card)
                })
                get("notifBox")[0].hidden = true
                turn.enterState("draw")
        }
        })
    }
}