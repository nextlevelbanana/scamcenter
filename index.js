import kaboom from "kaboom";
import { fontColor, loanAmounts, margin, topMargin, turnsInRound } from "./constants";
import { addButton } from "./addButton";
import { addCredit } from "./addCredit";
import { initializeGame } from "./initializeGame";
import { black, red, cyan, white } from "./colors";
import {refreshHand} from "./refreshHand";
import { notifs } from "./notifs";

kaboom({
    background:[215,155,25]
  })

loadSound("titleBGM", "./assets/sound/Mr_Moneybags_Rag.mp3")
loadSound("mainBGM", "./assets/sound/The_Grift.mp3")
loadSound("dealOne", "./assets/sound/deal_one.wav")
loadSound("slotHandle", "./assets/sound/slot_handle.wav")
loadSound("cashRegister", "./assets/sound/cash_register.wav")

loadFont("duster", "./assets/duster.ttf")
loadSprite("placeholder", "./assets/sprites/placeholder.png")

const titleMusic = play("titleBGM", {
    loop: true,
    paused:true
})

const mainMusic = play("mainBGM", {
    loop: true, 
    paused: true
})

const loseMusic = null;


//-----------------------------------------------------------------------
scene("game", async () => {
    let turnNumber = 0
    let roundNumber = 0

    //stop other music
    //start mainBGM into, then => loop main-main
    // music.play("mainBGM", {
    //     loop: true
    // })

    let bankBalance = 0
    await initializeGame()



//     // for debugging only
//     //const loseButton = addButton("lose", vec2(600,300),() => go("lose"))

    const infobox = add([
        "infobox",
        rect(width() - 200, 120, { radius: 32 }),
        pos(margin, topMargin),
        outline(2)
    ])
    
    infobox.add([
        "infoText",
        color(black),
        text("", { size: 32}),
    ])

    const notifBox = add([
        rect(width()*.9, height()*.9, 32),
        color(Color.fromHex(cyan))
    ])

    notifBox.add([
        "notifText",
        text("", {
            width: width()*.8
        }),
        color(Color.fromHex(black))
    ])

    const closeNotif = notifBox.add([
        "closeNotif",
        rect(50,50),
        area(),
        color(Color.fromHex("#880088")),
        pos(800,0)
    ])

    closeNotif.add([
        text("X"),
        color(Color.fromHex(white))
    ])

    closeNotif.onClick(() => {
        notifBox.hidden = true
        turn.enterState("draw")
    })

    notifBox.hidden = true

   const bankBalanceUI = add([
    text(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(bankBalance)),
    color(Color.fromHex(red)),
    pos(width()-200, topMargin)
   ]);

   const updateBankBalanceUI = () => {
    console.log(bankBalance)
    bankBalanceUI.text = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(bankBalance)
    bankBalanceUI.color = bankBalance > 0 ? Color.fromHex(black) : Color.fromHex(red)
   }

   const discardUI = add([
    rect(200,100, {
        radius: 20
    }),
    pos(width() - 210, height() - 110),
    opacity(0.2)
   ])

   const discardUIText = add([
    text(`discard (${get("discard").length})`, {
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
    text(`deck (${get("deck").length})`, {
        size: 18
    }),
    color(black),
    pos(width() - 350, height() - 205)
   ])

    const turn = add([
        state("notif", ["notif", "draw", "play", "suckersMove", "moneyMoves", "griftsCrumble"])
    ])

    const checkForGameOver = () => {
        console.log("checking for game over")
        if (bankBalance < 0) {
            go("lose")
        } else {
            roundNumber++
        }
    }

    turn.onStateEnter("notif", () => {
        if (turnNumber == turnsInRound[roundNumber]) {
            checkForGameOver()
        } else {
            if (turnNumber == 0) {
                turnNumber++
                bankBalance -= 800 * (roundNumber + 1.5)
                showNotification()
            } else {
                turnNumber++
                turn.enterState("draw")
            }
        }
    })

    const showNotification = () => {
        notifBox.hidden = false
        notifBox.get("notifText")[0].text = notifs[roundNumber]
    }

    const confirmPlay = () => {
        const selected = get("hand").filter(c => c.isSelected)[0];
        //todo: how to play propups and frauds, invalid plays, etc
        playCard(selected);
        play("dealOne").then(() => turn.enterState("play"))
    }

    const confirmPlayButton = addButton("play?", vec2(width()*.9, height()*.9), confirmPlay)

    const griftPhases = ["hype", "adoption", "suspicion", "busted"]

    const playCard = card => {
        const i = get("inPlay").length
        card.unuse("hand")
        card.use("inPlay")
        card.isSelected = false
        card.pos = vec2(10 + 100*i, 500)
        card.get("phaseUI")[0].hidden = true
    }

    turn.onStateUpdate("draw", () => {
        roundNumber++
        confirmPlayButton.hidden = !get("hand").some(c => c.isSelected);           
    })

    turn.onStateEnter("draw", () => {
        updateBankBalanceUI()           
        refreshHand()
    })

    turn.onStateEnter("play", () => {
        confirmPlayButton.hidden = true;

        get("hand").forEach(card => {
            card.unuse("hand")
            card.use("discard")
            card.hidden = true
        })
        get("inPlay").forEach(card => {
            if (card.is("grifts")) {
                const phaseUI = card.get("phaseUI")[0]
                phaseUI.text = card.griftPhase ?? ""
                phaseUI.hidden = false
            }
        })

        play("slotHandle").then(() => turn.enterState("suckersMove"))
    })

    turn.onStateUpdate("play", () => {
        activeGrifts().forEach(grift => {
            grift.get("phaseUI").text = grift.griftPhase
        })
    })

    turn.onStateEnter("suckersMove", () => {
        //for each grift in play...
            //calculate its sucker delta
            //and update its sucker count
            //then update the UI
            //and play appropriate sound effect for net gain/loss
        //const activeGrifts = get("inPlay").filter(card => card.is("grifts"))

        activeGrifts().forEach(grift => {
            advanceGrifts()
            const phaseIndex = griftPhases.indexOf(grift.griftPhase)
            const deltaSuckers = grift.curve[phaseIndex]
            grift.suckers += deltaSuckers;
            grift.get("suckerCountUI")[0].text = `suckers: ${grift.suckers}`
       })

       turn.enterState("moneyMoves")
    })

    turn.onStateUpdate("suckersMove", () => {
    })

    turn.onStateEnter("moneyMoves", () => {
        const cashRegister = play("cashRegister", {paused: true})
        //for each grift in play,
            //money += suckers * suckerValue (currently all 10)
            //const activeGrifts = get("inPlay").filter(card => card.is("grifts"))

            activeGrifts().forEach(grift => {
                const oldBalance = bankBalance
                bankBalance += grift.suckers * (grift.suckerValue ?? 10)
                if (bankBalance > oldBalance) {
                    if (cashRegister.paused) {
                        play("cashRegister")
                    } else {
                        wait(0.3)
                        play("cashRegister")
                    }

                }
            })
            updateBankBalanceUI()           
        //todo: for each fraud played, money += fraud.value

        turn.enterState("griftsCrumble")
    })

    const activeGrifts = () => get("inPlay").filter(card => card.is("grifts"))

    turn.onStateEnter("griftsCrumble", () => {
        activeGrifts().forEach(grift => {
            if (grift.suckers < 3) {
                crumble(grift)
            } 
        })

        turn.enterState("notif")
    })

    const advanceGrifts = () => {
        activeGrifts().forEach(grift => {
            if (!grift.griftPhase) {
                grift.griftPhase = "hype";
            } else if (grift.griftPhase !== "busted") {
                const griftIndex = griftPhases.indexOf(grift.griftPhase)
                grift.griftPhase = griftPhases[griftIndex+1]
            }
        })
    }

    turn.onStateUpdate("griftsCrumble", () => {
        activeGrifts().forEach(grift => {
            grift.get("phaseUI")[0].text = grift.griftPhase
        })
    })

    const crumble = grift => {
        console.log("crumbly crumble!")
        //grift.suckers = 0
        //grift -> discard
        //any children -> discard
        //new consequence -> discard
        //sfx
    }

    onUpdate(() => {
        discardUIText.text = `discard (${get("discard").length})`
        deckUIText.text = `deck (${get("deck").length})`
    })

   
});


//-----------------------------------------------------------------
scene("title", () => {
    //TODO: if titlemusic is paused:
    //foreach musics, pause
    //titlemusic play
    
    
    add([
        color(Color.fromHex(fontColor)),
        pos(margin,height()/3),
        text("SCAMCENTER", {
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

scene("lose", async () => {
    const loseMsg = add([
        text("YOUR MEMBERSHIP HAS EXPIRED. BYE", {
            size: 144,
            width: 1600
        })
    ])

    await wait(2)
    
    loseMsg.hidden = true
    const restartButton = add([
            text("restart"),
            opacity(1),
            fadeIn(.6),
            pos(200,400),
            area()
        ])
    restartButton.onClick(() => {
        destroyAll("*")
        go("title")
    })
    const creditsButton = add([
        text("credits"),
        opacity(1),
        fadeIn(.6),
        pos(600,400),
        area()
    ])
    creditsButton.onClick(() => {
        destroyAll("*")
        go("credits")
    })
})

function start() {
    go("title")
}

start()