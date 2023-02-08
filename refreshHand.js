import { margin } from "./constants";

export const refreshHand = () => {

    const drawCard = (i) => {
        const currentDeck = get("deck")

            let currentCard
                do {
                    currentCard = choose(currentDeck)
                } while (!currentCard || !currentCard.is("deck"))

                currentCard.unuse("deck")
                currentCard.unuse("crumbled")
                currentCard.use("hand")
                currentCard.hidden = false
                currentCard.pos = vec2(margin + 16 + 128*i, height() - 170 - margin)
                currentCard.get("cardBackground")[0].hidden = false
                currentCard.get("cardText").forEach(t => t.hidden = false)
                currentCard.get("phaseBar").forEach(p => {
                    p.hidden = true
                    p.get("dot").forEach(d => {
                        d.hidden = true
                        d.pos.x = 5
                    })
                })
                currentCard.get("dot").forEach(d => d.hidden = true)
                currentCard.get("meeples").forEach(m => destroy(m))
                if (currentCard.is("grifts")) {
                    currentCard.suckers = 0
                    currentCard.griftPhase = -1
                    currentCard.get("cardArt")[0].color = undefined
                }
        }

    //reshuffle if needed
    if (get("deck").length < 3) {

        const remainder = get("deck").length
        for(let i = 0; i < remainder; i++) {
            drawCard(i)
        }

        get("discard").forEach(card => {
            card.unuse("discard")
            card.use("deck")
        })

        while(get("hand").length < 3 && get("deck").length) {
            drawCard(get("hand").length)
        }

    } else { //enough cards
        for (let i = 0; i < 3; i++) {
            drawCard(i)
        }
    }
}