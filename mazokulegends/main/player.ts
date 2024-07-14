import { RpgPlayer, type RpgPlayerHooks, Control, Components } from '@rpgjs/server'
import Sword from './database/sword';

const player: RpgPlayerHooks = {
    onConnected(player: RpgPlayer) {
        //player.name = 'YourName'
        //player.setComponentsTop(Components.text('{name}'))



    },
    onInput(player: RpgPlayer, { input }) {
        if (input == Control.Back) {
            player.callMainMenu()
        }
    },
    async onJoinMap(player: RpgPlayer) {


        player.on('updateName',(message) => {
            console.log('updateName received');
            console.log(message.name);
            player.name = message.name
            player.setComponentsTop(Components.text(player.name))
            //player.changeMap('simplemap2',{x:290,y:370})
            //player.changeMap('simplemap',{x:200,y:200})
        });

        player.on('setPlayerGold',(message) => {
            console.log("Gold updated to "+message.amount);
            player.gold=message.amount;

        });

        player.on('addSword',(message) => {
            console.log("SS Sword event.")
            // Add sword to inventory
            if(!player.hasItem(Sword)){

                player.addItem(Sword);
            }
        });

        player.gui('my-hud').open();
        if (player.getVariable('AFTER_INTRO')) {
            return
        }
        //await player.showText('Welcome to Mazoku Legends, built on Radix!')
        player.setVariable('AFTER_INTRO', true)
    }
}

export default player