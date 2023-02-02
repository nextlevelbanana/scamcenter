import kaboom from "kaboom";
import { fontColor, loanAmounts, margin, topMargin } from "./constants";
import { addButton } from "./addButton";
import { addCredit } from "./addCredit";
import { initializeGame } from "./initializeGame";
import { black, red } from "./colors";
import { addHand } from "./addHand";

kaboom({
    background:[215,155,25]
  })

loadSound("titleBGM", "./assets/sound/Mr_Moneybags_Rag.mp3")
loadSound("mainBGM", "./assets/sound/The_Grift.mp3")
loadFont("duster", "./assets/duster.ttf")
loadSprite("placeholder", "./assets/sprites/placeholder.png")

const titleMusic = play("titleBGM", {
    loop: true,
})

titleMusic.paused = true

//-----------------------------------------------------------------------
scene("game", async () => {
    titleMusic.paused = true

    const gameMusic = play("mainBGM", {
        loop: true
    })

    const {deck, bankBalance, discard} = await initializeGame()
    let currentBalance = bankBalance * -1;

    const infobox = add([
        rect(width() - 200, 120, { radius: 32 }),
        pos(margin, topMargin),
        outline(2),
    ])
    
    const infotext = infobox.add([
        color(black),
        text("", { size: 32}),
    ])

   const bankBalanceUI = add([
    text(`-$${bankBalance}`),
    color(Color.fromHex(red)),
    pos(width()-200, topMargin)
   ]);

   const discardUI = add([
    rect(200,100, {
        radius: 20
    }),
    pos(width() - 210, height() - 110),
    opacity(0.2)
   ])

   const discardUIText = add([
    text(`discard (${discard.length})`, {
        size: 18
    }),
    color(black),
    pos(width()- 150, height() - 55)
   ])

   const deckUI = add([
    rect(200, 100, {
        radius: 20
    }),
    pos(width() - 420, height() - 110),
    color(Color.CYAN),
   ])

   const deckUIText = add([
    text(`deck (${deck.length})`, {
        size: 18
    }),
    color(black),
    pos(width() - 350, height() - 205)
   ])

   let [hand, handNames] = addHand([...(deck.splice(0,3))]);

   onHover("hand", card => {
        infotext.text = card.description
    })  

    onClick("hand", card => {
        if (card.isSelected) {
            card.isSelected = false;
            card.scale = vec2(1)
        } else {
            hand.forEach(c => {
                c.isSelected = false;
                c.scale = vec2(1);  
            })
            card.isSelected = true;
            card.scale = vec2(1.5);
        }
    })
});


//-----------------------------------------------------------------
scene("title", () => {
    add([
        color(Color.fromHex(fontColor)),
        pos(margin,height()/3),
        text("WELCOME TO SCAMTOWN", {
            size: 72,
            align: "left",
            font: "duster"
        })
    ])


    addButton("start", vec2(width()/3, height()*.666), () => go("game"))
    addButton("credits", vec2(width()*.666, height()*.666), () => go("credits"))

    const musicButton = addButton("play music", vec2(width()*.9, height()*.666), () => adjustMusic())

    const adjustMusic = () => {
        if(titleMusic.paused) {
            titleMusic.play()
            musicButton.text = "stop music"
        } else {
            titleMusic.paused = true
            musicButton.text = "play music"
        }
    }
})


scene("credits", () => {
    addCredit("Qristy Overton", "design, code", "nextlevelbanana.itch.io", 0)
    addCredit("Tuckie", "design, art", null, 1)
    addCredit("Robert Killen", "music, sfx", null, 2),
    addButton("back", vec2(margin, height()*.8), () => go("title"))

})

function start() {
    go("title")
}

start()