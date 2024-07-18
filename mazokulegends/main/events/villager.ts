import { RpgEvent, EventData, RpgPlayer, Move, Speed, Frequency } from '@rpgjs/server'

@EventData({
    name: 'EV-1',
    hitbox: {
        width: 32,
        height: 16
    }
})
export default class VillagerEvent extends RpgEvent {
    onInit() {
        this.setGraphic('hero3')
        this.randomMovement()
    }

    async randomMovement() {
        // Set slower speed and high frequency
        this.speed = Speed.Slow
        this.frequency = Frequency.High

        const generateRandomMove = () => {
            const direction = Math.floor(Math.random() * 4)
            const steps = 3 // Fixed number of steps

            switch (direction) {
                case 0:
                    return Move.tileDown(steps)
                case 1:
                    return Move.tileLeft(steps)
                case 2:
                    return Move.tileRight(steps)
                case 3:
                    return Move.tileUp(steps)
            }
        }

        while (true) {
            const moves = []
            for (let i = 0; i < 5; i++) { // Generate 5 random movements
                moves.push(generateRandomMove())
            }

            this.infiniteMoveRoute(moves)
            await new Promise(resolve => setTimeout(resolve, 5000)) // Wait for 5 seconds before changing the route
            this.breakRoutes(true) // Break current route to start a new one
        }
    }

    async onAction(player: RpgPlayer) {
        //player.emit('mintSword');
        await player.showText('Oh, hello! You should speak with the Blacksmith over there...', {
            talkWith: this
        })
        await player.showText('His swords are known for their supreme quality.', {
            talkWith: this
        })
    }
}