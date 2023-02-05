export const refreshHand = () => {
    //hand -> discard
    //deck -> hand
    get("hand").forEach(card => {
        card.unuse("hand");
        card.use("discard");
        card.hidden = true;
    })

    const currentDeck = get("deck");

    if (currentDeck.length < 3) {
        //todo
    }

    else {
        for (let i = 0; i < 3; i++) {
            let currentCard;
            do {
                currentCard = choose(currentDeck);
            } while (!currentCard || !currentCard.is("deck"));

            currentCard.unuse("deck");
            currentCard.use("hand");
            currentCard.hidden = false;
            currentCard.pos = vec2(10 + 250*i,700) //todo
        }
    }

    onHover("hand", card => {
        const infotext = get("infobox")[0].get("infoText")[0]
        infotext.text = card.description
        if (card.is("grifts")) {
            infotext.text += `\nsucker curve:${card.curve.join("/")}`
        }
    })

    onClick("hand", card => {
        if (card.isSelected) {
            card.isSelected = false
            card.scale = vec2(1)
        } else {
            get("hand").forEach(c => {
                c.isSelected = false;
                c.scale = vec2(1);  
            })
            card.isSelected = true;
            card.scale = vec2(1.5);
        }
    })
}