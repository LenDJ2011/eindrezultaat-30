input.onButtonPressed(Button.A, function on_button_pressed_a() {
    //  Hierbij wordt jouw eigen huidige (dodge‑)rij als doel gestuurd
    radio.sendValue("shot", dodgerRow)
    basic.showIcon(IconNames.Heart)
    basic.pause(200)
    basic.clearScreen()
})
input.onGesture(Gesture.Shake, function on_gesture_shake() {
    
    if (!gameOver) {
        //  - Verplaats obstakels: schuif elke kolom één positie naar links
        for (let i = 0; i < 4; i++) {
            obstacles[i] = obstacles[i + 1]
        }
        //  - Genereer een nieuwe obstakel in kolom 4 (40% kans)
        if (Math.randomRange(1, 10) <= 4) {
            obstacles[4] = Math.randomRange(0, 4)
        } else {
            obstacles[4] = -1
        }
        
        //  Controleer of er een botsing is:
        //  Als er in kolom 0 een obstakel is en dat obstakel op jouw rij staat.
        if (obstacles[0] == playerY) {
            gameOver = true
            basic.clearScreen()
            basic.showString("GAME OVER")
        } else {
            //  Geen botsing: verhoog jouw progressie en stuur hem via de radio
            progress += 1
            radio.sendValue("progress", progress)
        }
        
        //  Teken het speelveld:
        basic.clearScreen()
        //  Teken obstakels
        for (let x = 0; x < 5; x++) {
            if (obstacles[x] != -1) {
                led.plot(x, obstacles[x])
            }
            
        }
        //  Teken jouw speler op kolom 0
        led.plot(0, playerY)
        basic.pause(300)
    }
    
})
input.onLogoEvent(TouchButtonEvent.Pressed, function on_logo_pressed() {
    
    //  Update de dodger-positie met de accelerometer.
    rawAccel = input.acceleration(Dimension.Y)
    //  Map de accelerometerwaarde (van -1023 t/m +1023) naar een rij (0 t/m 4).
    dodgerRow = Math.round(Math.map(rawAccel, -1023, 1023, 0, 4))
    //  Zorg dat de rij binnen het bereik blijft:
    if (dodgerRow < 0) {
        dodgerRow = 0
    } else if (dodgerRow > 4) {
        dodgerRow = 4
    }
    
    //  Teken de status: Eerst maak je het scherm leeg…
    basic.clearScreen()
    //  ... teken de kogel als deze actief is.
    if (bulletActive) {
        led.plot(bulletX, bulletRow)
    }
    
    //  ... teken altijd jouw speler (dodger) op de rechterkant (kolom 4).
    led.plot(4, dodgerRow)
    //  Wanneer de kogel in kolom 4 komt, kijk dan of deze jouw speler raakt.
    if (bulletActive && bulletX == 4) {
        if (bulletRow == dodgerRow) {
            lives += -1
            basic.showIcon(IconNames.Sad)
            basic.pause(1000)
            basic.clearScreen()
            //  Controleer op game over
            if (lives <= 0) {
                basic.showString("GAME OVER")
                //  Het spel stopt hier.
                control.reset()
            }
            
            //  Zet de kogel simulatieronaf, of de kogel is gevolgd en geraakt.
            bulletActive = false
        }
        
    }
    
    basic.pause(200)
    //  Als er een kogel actief is, werk dan de positie bij: deze loopt van links naar rechts.
    if (bulletActive) {
        bulletX += 1
        //  Als de kogel voorbij kolom 4 verdwijnt, is deze voorbij (en niet raak).
        if (bulletX > 4) {
            bulletActive = false
        }
        
    }
    
})
input.onButtonPressed(Button.B, function on_button_pressed_b() {
    
    //  Ga omlaag als je niet onderaan bent
    if (!gameOver && playerY < 4) {
        playerY += 1
    }
    
})
//  Wanneer een schot (kogelsignaal) wordt ontvangen, start de kogelsimulatie.
radio.onReceivedValue(function on_received_value(name: string, value: number) {
    
    if (name == "shot") {
        //  Zorg ervoor dat je één kogel tegelijk afhandelt
        if (!bulletActive) {
            bulletActive = true
            bulletRow = value
            bulletX = 0
        }
        
    }
    
})
let bulletX = 0
let bulletActive = false
let rawAccel = 0
let progress = 0
let obstacles : number[] = []
let bulletRow = 0
let dodgerRow = 0
let lives = 0
let playerY = 0
let gameOver = false
let opponentProgress = 0
//  Zorg dat beide micro:bits in dezelfde radio-groep zitten.
radio.setGroup(7)
//  Aantal levens en spelvariabelen
lives = 3
//  De huidige rij van jouw speler (op kolom 4)
dodgerRow = 2
//  Huidige kolom van de kogel (0 t/m 4)
//  Rij waarop de inkomende kogel beweegt
bulletRow = 2
radio.setGroup(7)
//  Jouw vooruitgang
//  Finishlijn
let finish = 50
//  Voortgang van de tegenstander
//  Start in het midden (rij 2, rijen lopen van 0 (boven) tot 4 (onder))
playerY = 2
//  Obstakels worden bijgehouden per kolom (0 t/m 4).
//  Een waarde van -1 betekent: geen obstakel.
//  Anders geeft de waarde de rij (0 tot 4) van het obstakel aan.
obstacles = [-1, -1, -1, -1, -1]
