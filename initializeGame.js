import {loanAmounts, startingDeckComposition} from "./constants"
import { shuffle } from "./shuffle";

export const initializeGame = async() => {
    const selectedCards = [];

    const categories = ["grifts", "frauds", "propups"]

    for(const category of categories) {
        let res = await fetch(`./data/${category}0.json`)
        let json = await res.json()
        for (i = 0; i < startingDeckComposition[category]; i++) {
            const selected = json[randi(startingDeckComposition[category])];
            selectedCards.push(selected);
        }
    }

    res = await fetch(`./data/specials.json`)
    json = await res.json()
    const relevantItems = json.filter(item => item.kind == "defer")
    for (i = 0; i < startingDeckComposition.specials; i++) {
        selectedCards.push(relevantItems[randi(startingDeckComposition.specials)])
    }


    return {
        bankBalance: loanAmounts[0], 
        deck: shuffle(selectedCards),
        hand: [],
        discard: []
    }
}