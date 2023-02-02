import { margin } from "./constants";
import { black } from "./colors";

export const addHand = (cards) => {
    const hand = [];
    const handNames = [];

    cards.forEach((card, i) => {
        const thisCard = add([
            sprite("placeholder"),
            pos(margin + 200*i, height() - 205),
            color(black),
            area(),
            "hand",
            card
        ]);

        hand.push(thisCard);

        const thisCardText = thisCard.add([
            color(black),
            text(card.name, {
                size: 24
            }),
            pos(0, -40)
        ])

        handNames.push(thisCardText);
    });

    return [hand, handNames];
}