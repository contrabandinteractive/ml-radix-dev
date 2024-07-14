<template>
    <div>
        <radix-connect-button />
    </div>
</template>

<script>
import { RadixDappToolkit, RadixNetwork, DataRequestBuilder } from '@radixdlt/radix-dapp-toolkit'
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";

/*
const rdt = RadixDappToolkit({
  dAppDefinitionAddress:
    'account_rdx12y7md4spfq5qy7e3mfjpa52937uvkxf0nmydsu5wydkkxw3qx6nghn',
  networkId: RadixNetwork.Mainnet,
  applicationName: 'Radix Web3 dApp',
  applicationVersion: '1.0.0',
})
*/

const rdt = RadixDappToolkit({
    dAppDefinitionAddress:
        'account_tdx_2_12yma6qy8paks43zttxj5zqqdsqer0gluvzwc2vrwlhyf8wj0kyue2v',
    networkId: RadixNetwork.Stokenet,
    applicationName: 'Mazoku Legends',
    applicationVersion: '1.0.0',
})

let account;
let fullName;

const gatewayApi = GatewayApiClient.initialize(rdt.gatewayApi.clientConfig);



// ************ Connect to wallet and display details ************
//rdt.walletApi.setRequestData(DataRequestBuilder.accounts().exactly(1));

/*
rdt.walletApi.setRequestData(
  DataRequestBuilder.config({
    personaData: { fullName: true },
    accounts: { numberOfAccounts: { quantifier: 'atLeast', quantity: 1 } },
  }),
);
// Subscribe to updates to the user's shared wallet data, then display the account name and address.
rdt.walletApi.walletData$.subscribe((walletData) => {
  console.log("connected wallet data: ", walletData);
  // Set the account variable to the first and only connected account from the wallet
  account = walletData.accounts[0].address;
  // Display the account name and address on the page
  console.log('account: '+account)

  fullName = walletData.personaData[0].fields.givenNames + ' ' + walletData.personaData[0].fields.familyName;
  console.log(fullName);
  updateName(fullName);
  //socket.emit('accept',{ name: fullName });


});
*/

export default {
    name: 'my-hud',
    inject: ['rpgSocket'],
    data() {
        return {
            hp: 0,
            maxHp: 0
        }
    },
    mounted() {
        //this.setupWalletConnection();
        this.delaySetupWalletConnection();

        this.rpgSocket().on('mintSword', async (data) => {
            const socket = this.rpgSocket();
            console.log('minting sword');

            rdt.walletApi.setRequestData(
                DataRequestBuilder.config({
                    personaData: { fullName: true },
                    accounts: { numberOfAccounts: { quantifier: 'atLeast', quantity: 1 } },
                }),
            );

            rdt.walletApi.walletData$.subscribe(async (walletData) => {
                console.log("connected wallet data: ", walletData);

                // Set the account variable to the first and only connected account from the wallet
                const account = walletData.accounts[0].address;
                const xrdAddress = "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"; // Stokenet?
                console.log('account: ' + account);

                const fullName = walletData.personaData[0].fields.givenNames + ' ' + walletData.personaData[0].fields.familyName;
                console.log(fullName);
                this.updateName(fullName);

            const result = await rdt.walletApi.sendTransaction({
                    transactionManifest: `CALL_METHOD
    Address("account_tdx_2_1297z9tapdcju25u0fzz2gym728yvsmflxk6jfpyjlkuajw94yjynm7")
    "withdraw"
    Address("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc")
    Decimal("5")
;
TAKE_FROM_WORKTOP
    Address("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc")
    Decimal("5")
    Bucket("bucket1")
;
CALL_METHOD
    Address("component_tdx_2_1czvnl7qwasalpuxwaz2gq409vkuvtt3ur5y96nf70qex6dx3s6crtf")
    "buy_sword"
    Bucket("bucket1")
;
CALL_METHOD
    Address("account_tdx_2_1297z9tapdcju25u0fzz2gym728yvsmflxk6jfpyjlkuajw94yjynm7")
    "try_deposit_batch_or_refund"
    Expression("ENTIRE_WORKTOP")
    Enum<0u8>()
;`,
                });

                if (result.isErr()) throw result.error;
                console.log("Buy Sword result:", result.value);

                // Fetch the transaction status from the Gateway API
                const transactionStatus = await gatewayApi.transaction.getStatus(
                    result.value.transactionIntentHash
                );
                console.log("Buy Sword transaction status:", transactionStatus);

                //Update sword in inventory
                if(transactionStatus.intent_status=="CommittedSuccess"){
                    socket.emit('addSword', { sword: true });
                }

            });




        });
    },
    methods: {
        handleClick() {
            const socket = this.rpgSocket();
            socket.emit('updateName', { name: "Test" });
        },
        updateName(name) {
            const socket = this.rpgSocket();
            socket.emit('updateName', { name: name });
        },
        setupWalletConnection() {
            const socket = this.rpgSocket();
            rdt.walletApi.setRequestData(
                DataRequestBuilder.config({
                    personaData: { fullName: true },
                    accounts: { numberOfAccounts: { quantifier: 'atLeast', quantity: 1 } },
                }),
            );

            // Subscribe to updates to the user's shared wallet data, then display the account name and address.
            rdt.walletApi.walletData$.subscribe(async (walletData) => {
                console.log("connected wallet data: ", walletData);

                // Set the account variable to the first and only connected account from the wallet
                const account = walletData.accounts[0].address;
                console.log('account: ' + account);

                const fullName = walletData.personaData[0].fields.givenNames + ' ' + walletData.personaData[0].fields.familyName;
                console.log(fullName);
                this.updateName(fullName);

                const playerEntityDetails = await gatewayApi.state.getEntityDetailsVaultAggregated(account);

                console.log(playerEntityDetails);

                // Define the consistent XRD resource address
                const consistentResourceAddress = "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc";

                // Find the amount for the given resource address
                let playerXrdAmount;

                // Check for XRD Balance
                playerEntityDetails.fungible_resources.items.forEach(resource => {
                    if (resource.resource_address === consistentResourceAddress) {
                        playerXrdAmount = resource.vaults.items[0].amount;
                    }
                });

                console.log("XRD Amount: "+playerXrdAmount);
                // Set Player Gold
                socket.emit('setPlayerGold', { amount:playerXrdAmount });


                // Check for Sword, add to item if we have it
                let hasSword = false;
                const swordAddress = "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc";
                playerEntityDetails.fungible_resources.items.forEach(resource => {
                    if (resource.resource_address === swordAddress) {
                        hasSword = true;
                        console.log("Sword detected");
                        socket.emit('addSword', {hasSword:true})
                    }
                });


            });
        },
        delaySetupWalletConnection() {
            setTimeout(() => {
                this.setupWalletConnection();
            }, 3000);
        }
    },
    computed: {
        width() {
            return ((this.hp / this.maxHp) * 100) + '%'
        }
    }
}
</script>

<style>
.health-bar {
    width: 200px;
    margin-top: 10px;
    margin-left: 10px;
    background: rgba(0, 0, 0, 0.3)
}

.health-bar p {
    margin: 5px;
    color: white;
    font-size: 21px;
    font-weight: bold;
}

.bar {
    border: 2px solid black;
    border-radius: 5px;
    position: relative;
}

.inner-bar {
    background: #c54;
    height: 10px;
    position: relative;
    transition: width .5s linear;
}
</style>