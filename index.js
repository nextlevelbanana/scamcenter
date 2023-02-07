import kaboom from "kaboom";
import { fontColor, fontSize, loanAmounts, margin, topMargin, turnsInRound } from "./constants";
import { addButton } from "./addButton";
import { addCredit } from "./addCredit";
import { initializeGame } from "./initializeGame";
import { black, red, yellow, white, green } from "./colors";
import {refreshHand} from "./refreshHand";
import { notifs } from "./notifs";
import { updateInfoText } from "./updateInfoText";
import { createThreePotentialCards } from "./createThreePotentialCards";
import {handleCardSelect} from "./handleCardSelect";

kaboom({
   width: 640,
   height: 320,
   scale: 2
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
loadSprite("ceo", "./assets/sprites/ceo.png")
loadSprite("moneyIcon", "./assets/sprites/icon_money.png", {
    scale: 2
})
loadSprite("timeIcon", "./assets/sprites/icon_time.png", {
    scale: 2
})
loadSprite("playButton", "./assets/sprites/button_play.png")
loadSprite("skipButton", "./assets/sprites/button_skip.png", {
    scale: 2
})
loadSprite("sucker", "./assets/sprites/icon_sucker.png")
loadSprite("phaseBar", "./assets/sprites/grift_status_bar.png")
loadSprite("dot", "./assets/sprites/grift_status_indicator.png")

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
        sprite("ui_default", {
            width: 128,
            height: 64
        }),
        scale(2),
        pos(372, 134),
        z(2000)
        
    ])
    
    infobox.add([
        "infoText",
        color(Color.fromHex(black)),
        scale(0.5),
        pos(16,16),
        text("", { size: fontSize.sm, width: 192}),
    ])

    infobox.add([
        sprite("ceo"),
        scale(0.25),
        pos(96,32)
    ])

    infobox.hidden = true

    // onHover("hasInfoText", () => {
    //     console.log("onhovertext")
    //     infobox.hidden = false
    // })

    // onHoverEnd("hasInfoText", () => {
    //     ("endhover")
    //     infobox.hidden = true
    //     updateInfoText("")
    // })
    
    // const uiBox = add([
    //     "whichGrift",
    //     sprite("ui_default"),
    //     pos(width() - 192 - (2*margin), height() - 96 - margin),
    //     scale(2),
    //     z(3000)
    // ])

    // uiBox.add([
    //     text("Prop up which grift?", {
    //         font: "duster",
    //         size: fontSize.sm,
    //         width: 90
    //     }) ,
    //     color(Color.fromHex(black)),
    //     scale(0.5),
    //     pos(8,24)
    // ])

    //uiBox.hidden = true

    // onHoverUpdate("propups", (thing) => {
    //     console.log("hoverUpdate")
    //     if (thing.isSelected) {
    //         infobox.hidden = true
    //         //uiBox.hidden = false
    //     }
    // })

    onHover("card", card => {
        console.log("hovercard")
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

    notifBox.add([
        sprite("ceo"),
        pos(240,96),
        scale(0.5)
    ])

    const closeNotif = notifBox.add([
        "closeNotif",
        sprite("ui_default"),
        area(),
        scale(0.75),
        pos(263,0)
    ])

    closeNotif.add([
        text("X"),
        color(Color.fromHex(black)),
        pos(18,16),
        scale(0.5)
    ])

    closeNotif.onClick(() => {
        notifBox.hidden = true
        turn.enterState("addCardToDeck")
    })

    notifBox.hidden = true

    const bankBalanceIcon = add([
        sprite("moneyIcon"), 
        pos(498, 7)
    ])

    const bankBalanceUI = bankBalanceIcon.add([
        text(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(bankBalance), {
            size: fontSize.med,
            font: "duster"
        }),
        color(Color.fromHex(red)),
        pos(20, 0)
    ])

    const turnsLeftIcon = add([
        sprite("timeIcon"), 
        pos(342, 7)
    ])
    
    const turnsLeftUI = turnsLeftIcon.add([
        text(turnsInRound[roundNumber] - turnNumber, {
            size: fontSize.med,
            font: "duster"
        }),
        color(Color.fromHex(green)),
        pos(20,0)
    ])

    const updateTurnsLeftUI = () => {
        const turnsLeft = turnsInRound[roundNumber] - turnNumber
        turnsLeftUI.text = turnsLeft
        turnsLeftUI.color = turnsLeft < 3 ? Color.fromHex(red) :
            turnsLeft < 6 ? Color.fromHex(yellow) : Color.fromHex(green)
    }

   const updateBankBalanceUI = (value) => {
    if (value) {
        bankBalance += value
    }
    bankBalanceUI.text = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(bankBalance)
    bankBalanceUI.color = bankBalance > 0 ? Color.fromHex(black) : Color.fromHex(red)
   }

   const discardUI = add([
    "discardUI",
    "hasInfoText",
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
        color(Color.fromHex(black)),
        pos(20,10)
    ])

    onHover("discardUI", () => {
        updateInfoText("cards in discard")
    })

   const deckUI = add([
    "deckUI",
    "hasInfoText",
    pos(width() - 192 - (2*margin), height() - 60 - margin),
    sprite("deck_indicator"),
    scale(2),
    area()
   ])

    onHover("deckUI", () => {
        updateInfoText("cards remaining in deck")
    })

   const deckUIText = deckUI.add([
    text(`${get("deck").length}`, {
        size: fontSize.sm,
        font: "duster"
    }),
    color(Color.fromHex(black)),
    pos(20, 10)
   ])

    const turn = add([
        "turn",
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
        console.log("entering notif")
        if (turnNumber >= (turnsInRound[roundNumber] ?? 1)) {
            checkForGameOver()
            roundNumber++
            turnNumber = 0
        } 
        updateTurnsLeftUI()
        
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

    const confirmPlayButton = add([
        "playButton",
        sprite("playButton"),
        scale(2),
        area(),
        pos(width() - 192 - (2*margin), height() - 96 - margin),
    ])

    confirmPlayButton.onClick(confirmPlay)

    const griftPhases = ["hype", "adoption", "suspicion", "busted"]

    const playGrift = card => {
        const i = get("inPlay").filter(c => c.is("grifts")).length
        const cardsPerRow = 6
        card.use("inPlay")
        card.griftPhase = -1
        card.pos = vec2(16 + 96*(i % cardsPerRow), margin + 40 + (100 * Math.floor(i/cardsPerRow)))
        card.get("phaseBar")[0].hidden = false
    }

    const playFraud = card => {
        card.use("inPlay")
    }



    const playPropup = card => {
        const propuppable = get("inPlay")?.filter(c => c.is("grifts"))
        if (!propuppable || !propuppable.length) {
            play("nope")
            //updateInfoText("nothing to prop up!")
            card.isSelected = false
            card.pos.y += 8
        } else {
            card.use("active")
            //updateInfoText("Prop up which grift?")
            //console.log("here?")
            propuppable.forEach(card => {
                const propuppable = card.add([
                    "propuppable",
                    sprite("cursor"),
                    area(),
                    scale(2),
                    pos(16, 16)
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
        selectedPropup.pos = vec2(selectedGrift.pos.x + (rand(64)-8), selectedGrift.pos.y - (rand(64)-8))
        selectedPropup.z = 105
        selectedPropup.use("inPlay")
        selectedPropup.unuse("active")
        // destroyAll("whichGrift")
        onPropUp(selectedPropup, selectedGrift)
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
                sprite("skipButton"),
                scale(2),
                area(),
                pos(width() - 96 - margin, height() - 96 - margin),
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
        console.log("refreshhand")    
        refreshHand()
        showSkipTurnButton(true)
    })

    turn.onStateEnd("draw", () => {
        showSkipTurnButton(false)
        get("card").forEach(c => {
            c.isSelected = false
        })
        get("inPlay").forEach(c => {
            c.get("cardBackground")[0].hidden = true
            c.get("cardText").forEach(t => {
                t.hidden = true
            })
        })
        activeGrifts().forEach(g => {
            const cursor = g.children?.filter(c => c.is("propuppable"))?.[0]
            if (cursor) {
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
                const dot = card.get("phaseBar")[0].get("dot")[0]
                dot.hidden = false
            }
        })

        play("slotHandle").then(() => turn.enterState("suckersMove"))
    })

    turn.onStateUpdate("play", () => {
        activeGrifts().forEach(grift => {
           // grift.get("phaseUI").text = griftPhases[grift.griftPhase]
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

        advanceGrifts()

        activeGrifts().forEach(grift => {
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
        console.log("end moneymove")
        activeFrauds().forEach(fraud => {
            fraud.unuse("inPlay")
            fraud.use("discard")
        })
    })

    const activeGrifts = () => get("inPlay").filter(card => card.is("grifts"))
    const activeFrauds = () => get("inPlay").filter(card => card.is("frauds"))

    turn.onStateEnter("griftsCrumble", () => {
        console.log("entering crumble")
        activeGrifts().forEach(grift => {
            if (grift.suckers < 3) {
                crumble(grift)
            } 
        })
        console.log("entering notif")
        turn.enterState("notif")
    })

    const advanceGrifts = () => {
        console.log("starting advanceGrift")
        activeGrifts().forEach(grift => {
            if (grift.griftPhase === undefined || grift.griftPhase === null) {
                grift.griftPhase = 0;
            } else if (grift.griftPhase < griftPhases.length - 1) {
                grift.griftPhase++
            }
            grift.get("phaseBar")[0].get("dot")[0].pos.x = 5 + 11*grift.griftPhase
        })
    }

    turn.onStateUpdate("griftsCrumble", () => {
        activeGrifts().forEach(grift => {
            
           // grift.get("phaseUI")[0].text = griftPhases[grift.griftPhase]
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