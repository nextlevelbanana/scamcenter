import {startingDeckComposition} from "./constants"
import { createCard } from "./createCard";

export const initializeGame = async() => {
    const selectedCards = [];

    const categories = ["grifts", "frauds", "propups"]

    for(const category of categories) {
        let res = await fetch(`./data/${category}0.json`)
        let json = await res.json()
        for (i = 0; i < startingDeckComposition[category]; i++) {
            const selected = json[randi(startingDeckComposition[category])];
            selected.kind = category
            selectedCards.push(selected);
        }
    }

    //todo: implement specials
    // res = await fetch(`./data/specials.json`)
    // json = await res.json()
    // const relevantItems = json.filter(item => item.kind == "defer")
    // for (i = 0; i < startingDeckComposition.specials; i++) {
    //     selectedCards.push(relevantItems[randi(startingDeckComposition.specials)])
    // }

    const deck = []

    selectedCards.forEach(card => {
        const newCardObj = createCard({...card}, "deck")
        newCardObj.hidden = true
        deck.push(newCardObj)
    })
}