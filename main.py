def on_button_pressed_a():
    # Hierbij wordt jouw eigen huidige (dodge‑)rij als doel gestuurd
    radio.send_value("shot", dodgerRow)
    basic.show_icon(IconNames.HEART)
    basic.pause(200)
    basic.clear_screen()
input.on_button_pressed(Button.A, on_button_pressed_a)

def on_gesture_shake():
    global gameOver, progress
    if not (gameOver):
        # - Verplaats obstakels: schuif elke kolom één positie naar links
        for i in range(4):
            obstacles[i] = obstacles[i + 1]
        # - Genereer een nieuwe obstakel in kolom 4 (40% kans)
        if Math.random_range(1, 10) <= 4:
            obstacles[4] = Math.random_range(0, 4)
        else:
            obstacles[4] = -1
        # Controleer of er een botsing is:
        # Als er in kolom 0 een obstakel is en dat obstakel op jouw rij staat.
        if obstacles[0] == playerY:
            gameOver = True
            basic.clear_screen()
            basic.show_string("GAME OVER")
        else:
            # Geen botsing: verhoog jouw progressie en stuur hem via de radio
            progress += 1
            radio.send_value("progress", progress)
        # Teken het speelveld:
        basic.clear_screen()
        # Teken obstakels
        for x in range(5):
            if obstacles[x] != -1:
                led.plot(x, obstacles[x])
        # Teken jouw speler op kolom 0
        led.plot(0, playerY)
        basic.pause(300)
input.on_gesture(Gesture.SHAKE, on_gesture_shake)

def on_logo_pressed():
    global rawAccel, dodgerRow, lives, bulletActive, bulletX
    # Update de dodger-positie met de accelerometer.
    rawAccel = input.acceleration(Dimension.Y)
    # Map de accelerometerwaarde (van -1023 t/m +1023) naar een rij (0 t/m 4).
    dodgerRow = Math.round(Math.map(rawAccel, -1023, 1023, 0, 4))
    # Zorg dat de rij binnen het bereik blijft:
    if dodgerRow < 0:
        dodgerRow = 0
    elif dodgerRow > 4:
        dodgerRow = 4
    # Teken de status: Eerst maak je het scherm leeg…
    basic.clear_screen()
    # ... teken de kogel als deze actief is.
    if bulletActive:
        led.plot(bulletX, bulletRow)
    # ... teken altijd jouw speler (dodger) op de rechterkant (kolom 4).
    led.plot(4, dodgerRow)
    # Wanneer de kogel in kolom 4 komt, kijk dan of deze jouw speler raakt.
    if bulletActive and bulletX == 4:
        if bulletRow == dodgerRow:
            lives += -1
            basic.show_icon(IconNames.SAD)
            basic.pause(1000)
            basic.clear_screen()
            # Controleer op game over
            if lives <= 0:
                basic.show_string("GAME OVER")
                # Het spel stopt hier.
                control.reset()
            # Zet de kogel simulatieronaf, of de kogel is gevolgd en geraakt.
            bulletActive = False
    basic.pause(200)
    # Als er een kogel actief is, werk dan de positie bij: deze loopt van links naar rechts.
    if bulletActive:
        bulletX += 1
        # Als de kogel voorbij kolom 4 verdwijnt, is deze voorbij (en niet raak).
        if bulletX > 4:
            bulletActive = False
input.on_logo_event(TouchButtonEvent.PRESSED, on_logo_pressed)

def on_button_pressed_b():
    global playerY
    # Ga omlaag als je niet onderaan bent
    if not (gameOver) and playerY < 4:
        playerY += 1
input.on_button_pressed(Button.B, on_button_pressed_b)

# Wanneer een schot (kogelsignaal) wordt ontvangen, start de kogelsimulatie.

def on_received_value(name, value):
    global bulletActive, bulletRow, bulletX
    if name == "shot":
        # Zorg ervoor dat je één kogel tegelijk afhandelt
        if not (bulletActive):
            bulletActive = True
            bulletRow = value
            bulletX = 0
radio.on_received_value(on_received_value)

bulletX = 0
bulletActive = False
rawAccel = 0
progress = 0
obstacles: List[number] = []
bulletRow = 0
dodgerRow = 0
lives = 0
playerY = 0
gameOver = False
opponentProgress = 0
# Zorg dat beide micro:bits in dezelfde radio-groep zitten.
radio.set_group(7)
# Aantal levens en spelvariabelen
lives = 3
# De huidige rij van jouw speler (op kolom 4)
dodgerRow = 2
# Huidige kolom van de kogel (0 t/m 4)
# Rij waarop de inkomende kogel beweegt
bulletRow = 2
radio.set_group(7)
# Jouw vooruitgang
# Finishlijn
finish = 50
# Voortgang van de tegenstander
# Start in het midden (rij 2, rijen lopen van 0 (boven) tot 4 (onder))
playerY = 2
# Obstakels worden bijgehouden per kolom (0 t/m 4).
# Een waarde van -1 betekent: geen obstakel.
# Anders geeft de waarde de rij (0 tot 4) van het obstakel aan.
obstacles = [-1, -1, -1, -1, -1]