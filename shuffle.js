export const shuffle = deck => {
    //The Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        // swap elements array[i] and array[j]
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    console.log("shuffled", deck)
    return deck
}