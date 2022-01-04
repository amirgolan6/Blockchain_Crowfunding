from datetime import datetime, timedelta
from web3 import Web3
from web3.middleware import geth_poa_middleware
from solc import compile_standard
import json, os


w3 = Web3(Web3.HTTPProvider(os.environ.get("ETH_HOST")))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

MIN_CONTRACT_TIME = 1 # in days
MAX_CONTRACT_TIME = 36500 # in days


class ServerContractManager:
    def __init__(self) -> None:
        comp = {
            "language": "Solidity",
            "sources": {
                "fundraiser.sol": {
                    "content":
                        open("app/contracts/fundraiser.sol", "r").read()
                },
            },
            "settings": {
                "outputSelection": { "*": { "*": [ "*" ], "": [ "*" ] } }
            }
        }
        compiled_sol = compile_standard(comp)
        self.bytecode = compiled_sol['contracts']['fundraiser.sol']['Fundraiser']['evm']['bytecode']['object']
        self.abi = json.loads(compiled_sol['contracts']['fundraiser.sol']['Fundraiser']['metadata'])['output']['abi']


    def get_fund_status(self, contract_address):
        Fundraiser = w3.eth.contract(
            address=contract_address,
            abi=self.abi
        )
        bal, funds_withdrawn, expires, goal = Fundraiser.functions.getStatus().call()
        return {
            "balance": bal,
            "expires": datetime.fromtimestamp(expires),
            "expired": datetime.now() > datetime.fromtimestamp(expires),
            "goal_reached": funds_withdrawn or goal < bal, 
            "goal": goal,
            "funds_withdrawn": funds_withdrawn
        }
