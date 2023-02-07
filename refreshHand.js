import { margin } from "./constants";

export const refreshHand = () => {

    const drawCard = (i) => {
        const currentDeck = get("deck");

            let currentCard;
                do {
                    currentCard = choose(currentDeck);
                } while (!currentCard || !currentCard.is("deck"));

                currentCard.unuse("deck");
                currentCard.use("hand");
                currentCard.hidden = false;
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
        }

    //reshuffle if needed
    if (get("deck").length < 3) {

        const remainder = get("deck").length
        for(let i = 0; i < remainder; i++) {
            drawCard(i)
        }

        console.log("41", get("deck").length, get("hand").length, get("discard").length)

        get("discard").forEach(card => {
            card.unuse("discard")
            card.use("deck")
        })

        console.log(get("deck").length)
        console.log(remainder)
        console.log(get("hand").length)

        while(get("hand").length < 3 && get("deck").length) {
            drawCard(get("hand").length)
        }
    //     for(let i = remainder - 1; i < Math.min(3, get("deck").length); i++) {
    //         console.log("drawing")
    //         drawCard(i)
    //    }
    } else { //enough cards
        console.log("enough cards")
        for (let i = 0; i < 3; i++) {
            drawCard(i)
        }
    }
}