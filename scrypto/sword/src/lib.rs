use scrypto::prelude::*;

#[derive(ScryptoSbor)]
pub struct Status {
    pub price: Decimal,
    pub amount: Decimal,
}

#[blueprint]
mod forge_sword {
    struct SwordForge {
        swords: Vault,
        collected_xrd: Vault,
        price: Decimal,
    }

    impl SwordForge {

        pub fn instantiate_forge(price: Decimal) -> Global<SwordForge> {

            let bucket_of_swords: Bucket = ResourceBuilder::new_fungible(OwnerRole::None)
                .divisibility(DIVISIBILITY_NONE)
                .metadata(metadata!(
                    init {
                        "name" => "Sword", locked;
                        "symbol" => "SWD", locked;
                        "description" => "A dangerous weapon", locked;
                    }
                ))
                .mint_initial_supply(9999)
                .into();

            Self {
                swords: Vault::with_bucket(bucket_of_swords),
                collected_xrd: Vault::new(XRD),
                price: price,
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::None)
            .globalize()
        }

        pub fn get_status(&self) -> Status {
            Status {
                price: self.price,
                amount: self.swords.amount(),
            }
        }

        pub fn buy_sword(&mut self, mut payment: Bucket) -> (Bucket, Bucket) {
            let our_share = payment.take(self.price);
            self.collected_xrd.put(our_share);


            (self.swords.take(1), payment)
        }
    }
}