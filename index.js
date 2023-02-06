import kaboom from "kaboom";
import { fontColor, fontSize, loanAmounts, margin, topMargin, turnsInRound } from "./constants";
import { addButton } from "./addButton";
import { addCredit } from "./addCredit";
import { initializeGame } from "./initializeGame";
import { black, red, cyan, white, green } from "./colors";
import {refreshHand} from "./refreshHand";
import { notifs } from "./notifs";
import { updateInfoText } from "./updateInfoText";
import { createThreePotentialCards } from "./createThreePotentialCards";
import {handleCardSelect} from "./handleCardSelect";

kaboom({
   width: 640,
   height: 320,
   scale: 2,
   stretch: true
  })

loadSound("titleBGMIntro", "./assets/sound/Mr_Moneybags_Rag_intro.mp3")
loadSound("titleBGMLoop", "./assets/sound/Mr_Moneybags_Rag_loop.mp3")

loadSound("mainBGMIntro", "./assets/sound/The_Grift_intro.mp3")
loadSound("mainBGMLoop", "./assets/sound/The_Grift_loop.mp3")

loadSound("loseMusic", "./assets/sound/Desolation_Rag_warped_loop.mp3")

loadSound("dealOne", "./assets/sound/deal_one.wav")
loadSound("slotHandle", "./assets/sound/slot_handle.wav")
loadSound("cashRegister", "./assets/sound/cash_register.wav")
loadSound("nope", "./assets/sound/nope.wav")
loadSound("scratch", "./assets/sound/scratch.mp3")

loadFont("duster", "./assets/duster.ttf")
loadSprite("placeholder", "./assets/sprites/placeholder.png")

loadSprite("deck_indicator", "./assets/sprites/deck_indicator.png")
loadSprite("discard_indicator", "./assets/sprites/discard_indicator.png")

loadSprite("ui_default", "./assets/sprites/ui_default.png", {
    slice9: {
        left: 16,
        right: 16,
        top: 16,
        bottom: 16
    },
    scale: 4
})
loadSprite("ui_fancy", "./assets/sprites/ui_fancy_1.png", {
    slice9: {
        left: 16,
        right: 16,
        top: 16,
        bottom: 16
    },
    scale: 4
})
loadSprite("cursor", "./assets/sprites/cursor.png", {
    scale: 4
})

loadSprite("bg", "./assets/sprites/Table_Background.png")
loadSprite("title", "./assets/sprites/TitleLogo.png")

let titleMusicIntro;
let titleMusic;
let mainMusicLoop;


//-----------------------------------------------------------------------

scene("game", async () => {
    if (titleMusicIntro) {
        titleMusicIntro.paused = true
    }
    if (titleMusic) {
        titleMusic.paused = true
    }
    const mainMusicIntro = play("mainBGMIntro").then(() => mainMusicLoop = play("mainBGMLoop", {loop:true}))

    let turnNumber = 0
    let roundNumber = 0
    let bankBalance = 0
    await initializeGame()

    const infobox = add([
        "infobox",
        pos(margin, topMargin),
        outline(2)
    ])
    
    infobox.add([
        "infoText",
        color(black),
        text("", { size: fontSize.big}),
    ])

    onHover("card", card => {
        updateInfoText(card.description)
        if (card.is("grifts")) {
            updateInfoText(`\nsucker curve:${card.curve.join("/")}`, true)
        }
    })

    onClick("card", card => handleCardSelect(card, turn))

    const notifBox = add([
        "notifBox",
        sprite("ui_default", {
            width: 300,
            height: 150
        }),
        pos(20,10),
        z(100),
        scale(2)
    ])

    notifBox.add([
        "notifText",
        text("", {
            width: width()*.8,
            size: fontSize.med,
            font: "duster"
        }),
        color(Color.fromHex(black)),
        pos(8,8),
        scale(0.5)
    ])

    const closeNotif = notifBox.add([
        "closeNotif",
        rect(50,50),
        area(),
        color(Color.fromHex("#880088")),
        pos(260,0)
    ])

    closeNotif.add([
        text("X"),
        color(Color.fromHex(white))
    ])

    closeNotif.onClick(() => {
        notifBox.hidden = true
        turn.enterState("addCardToDeck")
    })

    notifBox.hidden = true

   const bankBalanceUI = add([
    text(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(bankBalance)),
    color(Color.fromHex(red)),
    pos(width()-200, topMargin)
   ]);

   const updateBankBalanceUI = (value) => {
    if (value) {
        bankBalance += value
    }
    bankBalanceUI.text = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(bankBalance)
    bankBalanceUI.color = bankBalance > 0 ? Color.fromHex(black) : Color.fromHex(red)
   }

   const discardUI = add([
    "discardUI",
    pos(width() - 96 - margin, height() - 60 - margin),
    sprite("discard_indicator"),
    scale(2),
    area()
   ])

    const discardUIText = discardUI.add([
        text(`${get("discard").length}`, {
            size: fontSize.sm,
            font: "duster"
        }),
        color(black),
        pos(20,10)
    ])

    onHover("discardUI", () => {
        updateInfoText("cards in discard")
    })

    onHoverEnd("discardUI", () => {
        updateInfoText("")
    })

   const deckUI = add([
    "deckUI",
    pos(width() - 96 - margin, height() - 116 - margin),
    sprite("deck_indicator"),
    scale(2),
    area()
   ])

    onHover("deckUI", () => {
        updateInfoText("cards remaining in deck")
    })

    onHoverEnd("deckUI", () => {
        updateInfoText("")
    })

   const deckUIText = deckUI.add([
    text(`${get("deck").length}`, {
        size: fontSize.sm,
        font: "duster"
    }),
    color(black),
    pos(20, 10)
   ])

    const turn = add([
        state("notif", ["notif", "addCardToDeck", "draw", "play", "suckersMove", "moneyMoves", "griftsCrumble"])
    ])

    const checkForGameOver = () => {
        console.log("checking for game over")
        if (bankBalance < 0) {
            mainMusicLoop.paused = true
            play("scratch").then(() => {
                go("lose")
            })
        } else {
            roundNumber++
        }
    }

    const resetBoard = () => {
        // all in hand and in play and in discard go to deck
        for (const cardState of ["hand", "inPlay", "discard"])
        get(cardState).forEach(card => {
            card.unuse(cardState)
            card.use("deck")
            card.pos = vec2 (width() * 2, height() * 2)
            card.z = 1
        })
        //reset grifts
        get("grifts").forEach(grift => {
            grift.suckers = 0
            grift.griftPhase = -1})
    }

    turn.onStateEnter("notif", () => {
        if (turnNumber >= (turnsInRound[roundNumber] ?? 1)) {
            checkForGameOver()
            roundNumber++
            turnNumber = 0
        } 
        
        if (turnNumber == 0) {
            turnNumber++
            bankBalance -= 800 * (roundNumber + 1.5)
            resetBoard()
            showNotification()
        } else {
            turnNumber++
            turn.enterState("draw")
        }
    })

    const showNotification = () => {
        notifBox.hidden = false
        notifBox.get("closeNotif")[0].hidden = false

        notifBox.get("notifText")[0].text = notifs[roundNumber]
    }

    const confirmPlay = () => {
        const selected = get("hand").filter(c => c.isSelected)[0];
        playCard(selected)
    }

    const confirmPlayButton = addButton("play?", vec2(width()*.9, height()*.9), confirmPlay)

    const griftPhases = ["hype", "adoption", "suspicion", "busted"]

    const playGrift = card => {
        const i = get("inPlay").length
        const cardsPerRow = 3
        card.use("inPlay")
        card.pos = vec2(16 + 96*(i % cardsPerRow), margin + (100 * Math.floor(i/cardsPerRow)))//vec2(10 + 100*i, 150)
        card.get("phaseUI")[0].hidden = true       
    }

    const playFraud = card => {
        card.use("inPlay")
    }

    const playPropup = card => {
        const propuppable = get("inPlay")?.filter(c => c.is("grifts"))
        if (!propuppable || !propuppable.length) {
            play("nope")
            updateInfoText("nothing to prop up!")
            card.isSelected = false
            card.pos.y += 8
        } else {
            card.use("active")
            updateInfoText("Prop up which grift?")
            propuppable.forEach(card => {
                const propuppable = card.add([
                    "propuppable",
                    sprite("cursor"),
                    area(),
                    scale(2),
                    pos(48, 48)
                ])
            })
        }
    }

    const onPropUp = (propup, grift) => {
        console.log("propping up")
        switch (propup.affects) {
            case "suckers":
                grift.suckers += propup.value
                break;
            case "curve": 
                grift.griftPhase = Math.min(0, grift.griftPhase - propup.value)
            break;
        }
    }

    onClick("propuppable", thing => {
        const selectedGrift = thing.parent
        const selectedPropup = get("active")[0]
        selectedPropup.pos = vec2(selectedGrift.pos.x - 4, selectedGrift.pos.y - 4)
        selectedPropup.z = 5
        selectedPropup.use("inPlay")
        selectedPropup.unuse("active")
        onPropUp(selectedPropup, selectedGrift)
        console.log("done propping up")
        turn.enterState("play")
    })

    const playCard = card => {
        if (card.is("grifts")) {
            console.log("grift!")
            playGrift(card)
        } else if (card.is("frauds")) {
            console.log("fraud!")
            playFraud(card)
        } else if (card.is("propups")) {
            console.log("propup")
            playPropup(card)
        } else if (card.is("specials")) {
            console.log("special")
        }

        if (card.is("grifts") || card.is("frauds")) {
            play("dealOne").then(() => {
                turn.enterState("play")
            })
        }
    }

    turn.onStateUpdate("draw", () => {
        confirmPlayButton.hidden = !get("hand").some(c => c.isSelected);           
    })

    const showSkipTurnButton = (show) => {
        if (show) {
            const skipTurnButton = add([
                "skipButton",
                rect(100,32),
                area(),
                color(Color.fromHex(black)),
                pos(width()*.9, height()*.5)
            ])

            skipTurnButton.add([
                text("skip")
            ])

            skipTurnButton.onClick(() => turn.enterState("play"))
        } else {
            destroyAll("skipButton")
        }
    }

    turn.onStateEnter("addCardToDeck", async () => {
        notifBox.hidden = false
        notifBox.get("closeNotif")[0].hidden = true
        await createThreePotentialCards(turn)
        notifBox.get("notifText")[0].text = "CHOOSE YOUR FREE GIFT!!\n"
    })

    turn.onStateEnter("draw", () => {
        updateBankBalanceUI()           
        refreshHand()
        showSkipTurnButton(true)
    })

    turn.onStateEnd("draw", () => {
        showSkipTurnButton(false)
        get("card").forEach(c => {
            c.isSelected = false
        })
        activeGrifts().forEach(g => {
            const cursor = g.children?.filter(c => c.is("propuppable"))?.[0]
            if (cursor) {
                console.log(cursor)
                destroy(cursor)

            }
        })
    })

    const discard = () => {
        get("hand").forEach(card => {
            card.unuse("hand");
            if (!card.is("inPlay") || card.is("frauds")) {
                console.log("discarding", card)
                card.use("discard");
                card.hidden = true;
                card.pos = vec2(width()*1.2, height()*1.2)
            }
        })
    }

    turn.onStateEnter("play", () => {
        console.log("really entering play")
        confirmPlayButton.hidden = true

        discard()

        get("inPlay").forEach(card => {
            if (card.is("grifts")) {
                const phaseUI = card.get("phaseUI")[0]
                phaseUI.text = griftPhases[card.griftPhase] ?? ""
                phaseUI.hidden = false
            }
        })

        play("slotHandle").then(() => turn.enterState("suckersMove"))
    })

    turn.onStateUpdate("play", () => {
        activeGrifts().forEach(grift => {
            grift.get("phaseUI").text = griftPhases[grift.griftPhase]
        })
    })

    turn.onStateEnter("suckersMove", () => {
        console.log("suckers movin")
        //for each grift in play...
            //calculate its sucker delta
            //and update its sucker count
            //then update the UI
            //and play appropriate sound effect for net gain/loss
        //const activeGrifts = get("inPlay").filter(card => card.is("grifts"))

        activeGrifts().forEach(grift => {
            advanceGrifts()
            const deltaSuckers = grift.curve[grift.griftPhase]
            grift.suckers = Math.max(grift.suckers + deltaSuckers, 0);
            grift.get("suckerCountUI")[0].text = `suckers: ${grift.suckers}`
       })

       turn.enterState("moneyMoves")
    })

    turn.onStateUpdate("suckersMove", () => {
    })

    turn.onStateEnter("moneyMoves", () => {
        const cashRegister = play("cashRegister", {paused: true})
        console.log("money movin")
        console.log(get("inPlay"))
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

            activeFrauds().forEach(fraud => {
                bankBalance += fraud.amount
                play("cashRegister")
            })

            updateBankBalanceUI()           

        turn.enterState("griftsCrumble")
    })

    turn.onStateEnd("moneyMoves", () => {
        activeFrauds().forEach(fraud => {
            fraud.unuse("inPlay")
            fraud.use("discard")
        })
    })

    const activeGrifts = () => get("inPlay").filter(card => card.is("grifts"))
    const activeFrauds = () => get("inPlay").filter(card => card.is("frauds"))

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
            if (!grift.griftPhase || grift.griftPhase < 0) {
                grift.griftPhase = 0;
            } else if (grift.griftPhase < griftPhases.length - 1) {
                grift.griftPhase = griftPhases[grift.griftPhase+1]
            }
        })
    }

    turn.onStateUpdate("griftsCrumble", () => {
        activeGrifts().forEach(grift => {
            grift.get("phaseUI")[0].text = griftPhases[grift.griftPhase]
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
        discardUIText.text = `${get("discard").length}`
        deckUIText.text = `${get("deck").length}`
    })

});


//-----------------------------------------------------------------
scene("title", () => {

    add([
        sprite("bg"),
        scale(2),
        stay()
    ])

    add([
        sprite("title"),
        scale(4)
    ])
    let isExitingScene = false

    if ((!titleMusicIntro || titleMusicIntro.paused) && (!titleMusic || titleMusic.paused)) {
        titleMusicIntro = play("titleBGMIntro").then(() => {
            titleMusic = play("titleBGMLoop", {
            loop: true
            })
        })
    }



    addButton("start", vec2(540, height()*.333), () => isExitingScene = true)
    addButton("credits", vec2(540, height()*.666), () => go("credits"))

   // const musicButton = addButton("play music", vec2(width()*.9, height()*.666), () => adjustMusic())

    const adjustMusic = () => {
        if(titleMusic.paused) {
            titleMusic.play()
            musicButton.text = "stop music"
        } else {
            titleMusic.paused = true
            musicButton.text = "play music"
        }
    }

    const fadeOut = add([
        rect(width(), height()),
        opacity(0),
        color(Color.fromHex(black))
    ])

    onUpdate(() => {
        if (isExitingScene) {
            if (fadeOut.opacity > 0.95){
                go("game")
            } else {
                if (titleMusicIntro?.volume) {
                    titleMusicIntro.volume -= dt()
                } if (titleMusic?.volume) {
                    titleMusic.volume -= dt()
                }
                fadeOut.opacity += dt()
            }
        }
    })
})

scene("credits", () => {
    addCredit("Qristy Overton", "design, code", "nextlevelbanana.itch.io", 0)
    addCredit("Tuckie", "design, art", null, 1)
    addCredit("Robert Killen", "music, sound design", "sites.google.com/view/robert-killen-vgm-portfolio", 2),
    addButton("back", vec2(margin, height()*.8), () => go("title"))

})

scene("lose", async () => {
    play("loseMusic", {loop: true})
    const loseMsg = add([
        text("YOUR MEMBERSHIP HAS EXPIRED. BYE", {
            size: 68,
            width: 600
        })
    ])

    await wait(2)
    
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