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
            currentCard.pos = vec2(margin + 16 + 128*i, height() - 192 - margin) //todo
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

        for(let i = remainder; i < 3; i++) {
            drawCard(i)
       }
    }

    else {
        for (let i = 0; i < 3; i++) {
            drawCard(i)
        }
    }
}