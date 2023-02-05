import kaboom from "kaboom";
import { fontColor, loanAmounts, margin, topMargin, turnsInRound } from "./constants";
import { addButton } from "./addButton";
import { addCredit } from "./addCredit";
import { initializeGame } from "./initializeGame";
import { black, red, cyan, white } from "./colors";
import {refreshHand} from "./refreshHand";
import { notifs } from "./notifs";

kaboom({
   width: 640,
   height: 320,
   scale: 2,
   stretch: true
  })

loadSound("titleBGMIntro", "./assets/sound/Mr_Moneybags_Rag_intro.mp3")
loadSound("titleBGMLoop", "./assets/sound/Mr_Moneybags_Rag_loop.mp3")

loadSound("mainBGMIntro", "./assets/sound/The_Grift_-_intro.mp3")
loadSound("mainBGMLoop", "./assets/sound/The_Grift_-_full_loop.mp3")

loadSound("loseMusic", "./assets/sound/Desolation_Rag.mp3")

loadSound("dealOne", "./assets/sound/deal_one.wav")
loadSound("slotHandle", "./assets/sound/slot_handle.wav")
loadSound("cashRegister", "./assets/sound/cash_register.wav")
loadSound("nope", "./assets/sound/nope.wav")

loadFont("duster", "./assets/duster.ttf")
loadSprite("placeholder", "./assets/sprites/placeholder.png")
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
        text("", { size: 32}),
    ])

    onHover("card", card => {
        const infotext = get("infobox")[0].get("infoText")[0]
        infotext.text = card.description
        if (card.is("grifts")) {
            infotext.text += `\nsucker curve:${card.curve.join("/")}`
        }
    })

    onClick("card", card => {
        if (turn.state !== "draw" || !card.is("hand")) {
            return
        }
        console.log(card.id, card.name, card.isSelected)
        if (card.isSelected) {
            card.isSelected = false
            card.scale = vec2(1)
        } else {
            get("hand").forEach(c => {
                c.isSelected = false
                c.scale = vec2(1)
            })
            card.isSelected = true
            card.scale = vec2(1.5)
        }
    })

    const notifBox = add([
        sprite("ui_default", {
            width: 600,
            height: 300
        }),
        pos(20,10)
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

   const updateBankBalanceUI = (value) => {
    if (value) {
        bankBalance += value
    }
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
        if (turnNumber >= (turnsInRound[roundNumber] ?? 1)) {
            checkForGameOver()
            roundNumber++
            turnNumber = 0
        } 
        
        if (turnNumber == 0) {
            turnNumber++
            bankBalance -= 800 * (roundNumber + 1.5)
            showNotification()
        } else {
            turnNumber++
            turn.enterState("draw")
        }
    })

    const showNotification = () => {
        notifBox.hidden = false
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
        play("dealOne")
        card.use("inPlay")
        card.pos = vec2(10 + 300*i, 400)
        card.get("phaseUI")[0].hidden = true       
    }

    const playFraud = card => {
        play("cashRegister").then(() => {
            card.use("discard")
            play("dealOne")
            updateBankBalanceUI(card.amount)
        })
    }

    const playPropup = card => {
        const infoText = get("infobox")[0].get("infoText")[0]

        const propuppable = get("inPlay")?.filter(c => c.is("grifts"))
        if (!propuppable || !propuppable.length) {
            play("nope")
            infoText.text = "nothing to prop up!"
            card.isSelected = false
        } else {
            infoText.text = "Prop up which grift?"
            propuppable.forEach(card => {
                const propuppable = card.add([
                    "propuppable",
                    rect(100,100),
                    area(),
                    color(Color.fromHex("0099cc"))
                ])
            })
        }
    }

    onClick("propuppable", thing => {
        console.log(thing)
        //thing.parent = grift card
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
        card.isSelected = false
        card.scale = vec2(1)
        if (card.is("grifts") || card.is("frauds")) {
            turn.enterState("play")
        }
    }

    turn.onStateUpdate("draw", () => {
        confirmPlayButton.hidden = !get("hand").some(c => c.isSelected);           
    })

    const showSkipTurnButton = (show) => {
        if (show) {
            const skipTurnButton = add([
                "skipButton",
                rect(200,100),
                area(),
                color(Color.fromHex(black)),
                pos(width()*.9, height()*.6)
            ])

            skipTurnButton.add([
                text("skip")
            ])

            skipTurnButton.onClick(() => turn.enterState("play"))
        } else {
            destroyAll("skipButton")
        }
    }

    turn.onStateEnter("draw", () => {
        updateBankBalanceUI()           
        refreshHand()
        showSkipTurnButton(true)
    })

    turn.onStateEnd("draw", () => {
        showSkipTurnButton(false)
    })

    const discard = () => {
        get("hand").forEach(card => {
            card.unuse("hand");
            if (!card.is("inPlay")) {
                card.use("discard");
                card.hidden = true;
                card.pos = vec2(width()*1.2, height()*1.2)
            }
        })
    }

    turn.onStateEnter("play", () => {
        confirmPlayButton.hidden = true;

        discard()

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
            grift.suckers = Math.max(grift.suckers + deltaSuckers, 0);
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
    let isExitingScene = false

    if ((!titleMusicIntro || titleMusicIntro.paused) && (!titleMusic || titleMusic.paused)) {
        titleMusicIntro = play("titleBGMIntro").then(() => {
            titleMusic = play("titleBGMLoop", {
            loop: true
            })
        })
    }
        
    add([
        color(Color.fromHex(fontColor)),
        text("SCAMCENTER", {
            size: 72,
            align: "left",
            font: "duster"
        })
    ])


    addButton("start", vec2(width()/3, height()*.666), () => isExitingScene = true)
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

    const fadeOut = add([
        rect(width(), height()),
        opacity(0),
        color(Color.fromHex(black))

    ])

    onUpdate(() => {
        if (isExitingScene) {
            if (titleMusicIntro && !titleMusicIntro.paused) {
                console.log("titleMusicIntro")
            } if (titleMusic && !titleMusic.paused){
                console.log("titleMusic")
            }
            if (fadeOut.opacity > 0.95){
                //  && (!titleMusic || (!titleMusic.paused && titleMusic.volume < 0.1))
                //   && fadeOut.opacity > .95) {
                    console.log("here")
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
    addCredit("Robert Killen", "music, sfx", null, 2),
    addButton("back", vec2(margin, height()*.8), () => go("title"))

})

scene("lose", async () => {
    if (mainMusicLoop) {
        mainMusicLoop.paused = true
    }
    play("loseMusic")
    const loseMsg = add([
        text("YOUR MEMBERSHIP HAS EXPIRED. BYE", {
            size: 144,
            width: 1600
        })
    ])

    await wait(12)
    
    //loseMsg.hidden = true
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