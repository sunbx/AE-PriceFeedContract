const PriceFeedContract = `

include "List.aes"

contract PriceFeedContract =

  record price = {
    account         : address,
    desc            : string,
    price           : int}

  record state = {
    orcale_id       : oracle(string, int),
    account         : map(address,string),
    complete_prices : map(oracle_query(string, int),map(address,price)),
    prices          : map(oracle_query(string, int),list(int)),
    prices_account  : map(oracle_query(string, int),list(address)),
    prices_record   : map(oracle_query(string, int),int),
    owner           : address,
    price           : int,
    fee             : int,
    respond_count   : int,
    trading_coin    : string}

  stateful entrypoint init(fee : int) =
    let oracleFee = fee
    { orcale_id       = Oracle.register(Contract.address, fee, RelativeTTL(5000000)),
      price           = 0,
      fee             = oracleFee,
      account         = {},
      complete_prices = {},
      prices          = {},
      prices_account  = {},
      prices_record   = {},
      owner           = Call.caller,
      respond_count   = 1,
      trading_coin    = "AE/USET"}

  entrypoint getState() =
    state

  entrypoint getIsMapPriceExist(q : oracle_query(string, int),account: address) =
    getPriceComplet(q)

  entrypoint getIsRespondStatus(q : oracle_query(string, int)) =
    require(isPriceCompleteExist(q) , "Price not Existing")
    let prices = state.prices[q]
    require( List.length(prices) >= state.respond_count, "Respond count low")
    q

  entrypoint queryFee(o : oracle(string, int)) : int =
    Oracle.query_fee(o)

  stateful entrypoint updateConfig(respond_count : int) =
    put(state { respond_count = respond_count })

  stateful entrypoint respond( q : oracle_query(string, int)) =
    require(isPriceCompleteExist(q) , "Price not Existing")
    let prices = state.prices[q]
    require( List.length(prices) >= state.respond_count, "Respond count low")
    let price = List.get(List.length(prices)/2,List.sort((a, b) => a<b, prices))
    Oracle.respond(state.orcale_id, q, price)
    put( state { price = price , prices_record[q] = price})

    let price_list = state.prices_account[q]
    List.foreach(price_list,  (account) => Chain.spend(account, state.fee))

    price

  stateful entrypoint addOfferAccount(account : address , desc : string) =
    require(Call.caller == state.owner , "Contract not permissions")
    put( state { account[account] = desc})
    account

  stateful entrypoint removeOfferAccount(account : address) =
    require(Call.caller == state.owner , "Contract not permissions")
    let new_map = Map.delete(account , state.account)
    put( state { account = new_map})

  stateful entrypoint offerPrice(q : oracle_query(string, int) , price : int) =
    require(isAccountExist(Call.caller) , "Contract not permissions")

    let map_price = getPriceComplet(q)
    if(isMapPriceExist(map_price,Call.caller))
        abort( "Account offer exist")

    put( state {complete_prices[q = map_price][Call.caller] = {account = Call.caller , desc = getDesc(Call.caller),price = price}})

    let prices = getPrices(q)
    let p = List.insert_at(0, price,prices)
    put(state{ prices[q] = p})


    let prices_account = getPricesAccount(q)
    let pa = List.insert_at(0, Call.caller ,prices_account)
    put(state{ prices_account[q] = pa})
    price

  stateful entrypoint extraction() =
    Chain.spend(Contract.creator, Contract.balance)

  private function isAccountExist(addr: address): bool =
    switch(Map.lookup(addr, state.account))
      Some(account) => true
      None => false


  private function isMapPriceExist(map_price : map(address,price),account : address): bool =
    switch(Map.lookup(account, map_price))
      Some(price) => true
      None => false

  private function getPriceComplet(q : oracle_query(string, int)): map(address,price) =
    switch(Map.lookup(q, state.complete_prices))
      Some(price) => price
      None => {}

  private function isPriceExist(q : oracle_query(string, int)): bool =
    switch(Map.lookup(q, state.complete_prices))
      Some(price) => true
      None => false

  private function isPriceCompleteExist(q : oracle_query(string, int)): bool =
    switch(Map.lookup(q, state.prices))
      Some(price) => true
      None => false

  private function getDesc(addr: address) : string =
    switch(Map.lookup(addr, state.account))
      Some(desc) => desc
      None => abort("Account not found")

  private function getPrices(q : oracle_query(string, int)) : list(int) =
    switch(Map.lookup(q, state.prices))
      Some(prices) => prices
      None => []

  private function getPricesAccount(q : oracle_query(string, int)) : list(address) =
    switch(Map.lookup(q, state.prices_account))
      Some(prices) => prices
      None => []


	`
