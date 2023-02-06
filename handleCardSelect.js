export const handleCardSelect = (card, turn) => {
    if (turn.state !== "draw" || !card.is("hand")) {
        return
    }
    if (card.isSelected) {
        card.isSelected = false
        card.pos.y += 8
    } else {
        get("hand").forEach(c => {
            if (c.isSelected) {
                c.isSelected = false
                c.pos.y += 8
            }
        })
        card.isSelected = true
        card.pos.y -= 8
    }
}