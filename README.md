# AE-PriceFeedContract
This is an AE price aggregator contract
The contract is integrated with the oracle, and the data provider will return the latest price according to the oracle's query. The price will be quoted by multiple data providers, and finally the median value will be calculated and returned to the caller, so that the caller can reach the most real AE/USDT price


# How to use it?
It is no different from the traditional oracle invocation, which can be done through a contract or directly through a node

This is the currently deployed price aggregator, which you can query directly,

>op_mfPcbwJ3kySdk1zsm47S87Fh8MvnpjRRWVWwmXva7M9xTc8oP

You can use it with reference to the sample code

