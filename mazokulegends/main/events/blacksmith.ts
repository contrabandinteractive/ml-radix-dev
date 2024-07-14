import { RpgEvent, EventData, RpgPlayer } from '@rpgjs/server'

@EventData({
    name: 'blacksmith',
    hitbox: {
        width: 32,
        height: 16
    }
})
export default class BlacksmithEvent extends RpgEvent {
    onInit() {
        this.setGraphic('hero3')
    }
    async onAction(player: RpgPlayer) {
        let choice;
        choice = await player.showChoices('Greetings! Do you desire to purchase a sword?', [
            { text: 'Yes!', value: 1 },
            { text: 'No, thanks.', value: 0 }
        ]);


        if (choice.value == 1) {
            await player.showText('Excellent choice! That\'ll be 5 XRD, please!', {
                talkWith: this
            })
            player.emit('mintSword');

        } else {
            await player.showText('Alright. I know times are tough. Come back any time!', {
                talkWith: this
            })
        }

    }
} 