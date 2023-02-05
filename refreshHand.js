export const refreshHand = () => {
    //hand -> discard
    //deck -> hand
    get("hand").forEach(card => {
        card.unuse("hand");
        card.use("discard");
        card.hidden = true;
    })

    const drawCard = (i) => {
        const currentDeck = get("deck");

        let currentCard;
            do {
                currentCard = choose(currentDeck);
            } while (!currentCard || !currentCard.is("deck"));

            currentCard.unuse("deck");
            currentCard.use("hand");
            currentCard.hidden = false;
            currentCard.pos = vec2(10 + 250*i,700) //todo
    }

    if (get("deck").length < 3) {

        const remainder = get("deck").length
        for(let i = 0; i < remainder; i++) {
            drawCard(i)
        }

        get("discard").forEach(card => {
            card.unuse("discard")
            card.use("deck")
        })

        console.log(remainder)

        for(let i = remainder; i < 3; i++) {
            drawCard(i)
       }
    }

    else {
        for (let i = 0; i < 3; i++) {
            drawCard(i)
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