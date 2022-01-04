from datetime import datetime, timedelta

from flask.json.tag import TagTuple
from web3 import Web3
from web3.middleware import geth_poa_middleware
from solc import compile_standard
import json, os
from eth_account.messages import encode_defunct
from server_utilities import new_fund, end_fund
w3 = Web3(Web3.HTTPProvider(os.environ.get("ETH_HOST")))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

MIN_CONTRACT_TIME = 0 # in days
MAX_CONTRACT_TIME = 36500 # in days


class ClientContractManager:
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


    def createNewFundContract(self, account_add, owner1, owner2, owner3, goal, name, description, expires, wallet):
        if expires - datetime.now() < timedelta(days = MIN_CONTRACT_TIME):
            return {
                "result": "fail",
                "reason": "Contract expiry too short - need {} days minimum".format(MIN_CONTRACT_TIME)
            }
        if expires - datetime.now() > timedelta(days = MAX_CONTRACT_TIME):
            return {
                "result": "fail",
                "reason": "Contract expiry too long - need {} days maximum".format(MAX_CONTRACT_TIME)
            }
        if not wallet.is_unlocked(account_add):
            return {
                "result": "fail",
                "reason": "Creating account is not known or it's locked - Try unlocking with password first"
            }

        
        timelimit_seconds = int((expires - datetime.now()).total_seconds())
        
        account = wallet.create_w3_account(account_add)
        
        w3.eth.default_account = account.address
        
        Fundraiser = w3.eth.contract(abi=self.abi, bytecode=self.bytecode)
        transaction = Fundraiser.constructor(owner1, owner2, owner3, goal, timelimit_seconds).buildTransaction({'nonce': w3.eth.get_transaction_count(account_add)})
        signed_txn = wallet.signTransaction(account_add, transaction)

        try:
            tx_hash = w3.eth.sendRawTransaction(signed_txn.rawTransaction)
        except Exception as e:
            return {
                "result": "fail",
                "reason": str(e)
            }
        
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        contract_address = tx_receipt["contractAddress"]

        try:
            new_fund(contract_address, owner1, owner2, owner3, name, description)
        except Exception as e:
            print("Failed to contact manager")
            return {
                "result": "success",
                "fund_address": contract_address
            }

        return {
            "result": "success",
            "fund_address": contract_address
        }

    def fund_campaign(self, contract_address, amount, account_add, wallet):
        Fundraiser = w3.eth.contract(
            address=contract_address,
            abi=self.abi
        )
        account = wallet.create_w3_account(account_add)
        if account == "Unknown Account":
            return {
                "result": "fail",
                "reason": "Account is unknown or locked. Try unlocking first"
            }
        w3.eth.default_account = account.address

        try:
            transaction = Fundraiser.functions.fund(amount).buildTransaction({'nonce': w3.eth.get_transaction_count(account_add), 'value': amount})
        except Exception as e:
            return {
                "result": "fail",
                "reason": str(e)
            }
        signed_txn = wallet.signTransaction(account_add, transaction)

        try:
            tx_hash = w3.eth.sendRawTransaction(signed_txn.rawTransaction)
        except Exception as e:
            return {
                "result": "fail",
                "reason": str(e)
            }

        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        return {
            "result": "success",
            "reason": "Successfully funded fund: {} with {} wei".format(contract_address, amount)
        }

    def refund(self, contract_address, account_add, wallet):
        Fundraiser = w3.eth.contract(
            address=contract_address,
            abi=self.abi
        )
        account = wallet.create_w3_account(account_add)
        if account == "Unknown Account":
            return {
                "result": "fail",
                "reason": "Account is unknown or locked. Try unlocking first"
            }
        w3.eth.default_account = account.address

        try:
            transaction = Fundraiser.functions.refund().buildTransaction({'nonce': w3.eth.get_transaction_count(account_add)})
        except Exception as e:
            return {
                "result": "fail",
                "reason": str(e)
            }
        signed_txn = wallet.signTransaction(account_add, transaction)

        try:
            tx_hash = w3.eth.sendRawTransaction(signed_txn.rawTransaction)
        except Exception as e:
            return {
                "result": "fail",
                "reason": str(e)
            }
        

        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        return {
            "result": "success",
            "reason": "Successfully refunded account: {}".format(account)
        }

    def get_fund_status(self, contract_address):
        Fundraiser = w3.eth.contract(
            address=contract_address,
            abi=self.abi
        )
        bal, funds_withdrawn, expires, goal = Fundraiser.functions.getStatus().call()
        return {
            "balance": bal,
            "expired": datetime.now() > datetime.fromtimestamp(expires),
            "expires": datetime.fromtimestamp(expires).strftime("%Y/%m/%d, %H:%M:%S"),
            "goal_reached": funds_withdrawn or goal < bal, 
            "goal": goal,
            "funds_withdrawn": funds_withdrawn
        }

    def separate_sig(self, signature):
        #r, s, v
        signature = signature.replace('0x', "")
        return '0x' + signature[0:64], '0x' + signature[64:128], int(signature[128:], 16)

    def withdraw(self, contract_address, dest_account, account_add, second_signature, wallet):
        Fundraiser = w3.eth.contract(
            address=contract_address,
            abi=self.abi
        )
        
        account = wallet.create_w3_account(account_add)
        if account == "Unknown Account":
            return {
                "result": "fail",
                "reason": "Account is unknown or locked. Try unlocking first"
            }
        w3.eth.default_account = account.address
        balance, funds_withdrawn, expires, goal = Fundraiser.functions.getStatus().call()
        
        try:
            r,s,v = self.separate_sig(second_signature)
            transaction = Fundraiser.functions.withdraw(dest_account, r, s, v).buildTransaction({'nonce': w3.eth.get_transaction_count(account_add)})
        except Exception as e:
            return {
                "result": "fail",
                "reason": str(e)
            }
        signed_txn = wallet.signTransaction(account_add, transaction)

        try:
            tx_hash = w3.eth.sendRawTransaction(signed_txn.rawTransaction)
        except Exception as e:
            return {
                "result": "fail",
                "reason": str(e)
            }

        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
        end_fund(contract_address, balance, dest_account)
        return {
                "result": "success",
                "reason": "Successfully withdrew all funds from fundraiser {} to account {}".format(contract_address, dest_account),
                "balance": balance,
                "dest_account": dest_account
            }

    def to_32byte_hex(self, val):
        return Web3.toHex(Web3.toBytes(val).rjust(32, b'\0'))


    def create_signature(self, contract_address, dest_account, account_add, wallet):
        message = "{}{}".format(dest_account, contract_address)
        print("signing message: {} with account: {}".format(message, account_add), flush=True)
        account = wallet.create_w3_account(account_add)
        if account == "Unknown Account":
            return {
                "result": "fail",
                "reason": "Account is unknown or locked. Try unlocking first"
            }
        w3.eth.default_account = account.address

        message = Web3.soliditySha3(['address', 'address'], [Web3.toChecksumAddress(dest_account), Web3.toChecksumAddress(contract_address)])

        signed_message = account.sign_message(encode_defunct(message))

        return {
            "result": "success",
            "signed_message": Web3.toHex(signed_message['signature'])
        }