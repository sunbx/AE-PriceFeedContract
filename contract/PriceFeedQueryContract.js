const PriceFeedQuery = `

contract PriceFeedQuery =

  type o = oracle(string, int)
  type oq = oracle_query(string, int)

  type state = unit
  entrypoint init() = ()

  payable stateful entrypoint queryAePrice(oracle : o, currency : string) =
    let fee = Oracle.query_fee(oracle)
    require(Call.value == fee, String.concat("AMOUNT_NOT_EQUAL_FEE_", Int.to_str(fee)))
    require(Oracle.check(oracle), "ORACLE_CHECK_FAILED")
    Oracle.query(oracle, currency, fee, RelativeTTL(5), RelativeTTL(5))

  entrypoint checkQuery(oracle : o, query : oq) : option(int) =
    Oracle.get_answer(oracle, query)


	`
