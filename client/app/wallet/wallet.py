from tinyec.ec import SubGroup, Curve
from Crypto.Random.random import randint
from web3 import Web3
from web3.middleware import geth_poa_middleware
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import scrypt
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes
import json, os
from eth_account import Account


# Local wallet helps manage private and public keys
# keys are stored locally on disk and are encrypted using the password as an encryption key
# Only users with the password get access to the private keys
# Private keys should not be allowed to leave the local machine in any circumstance after decrytion
class EthWallet:
    p = int("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", 16)
    n = int("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16)

    x = int("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798", 16)
    y = int("483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8", 16)
    g = (x,y)
    h=1

    def __init__(self, data_file) -> None:
        self.data_file = data_file
        self.accounts = dict() # keys that are currently decrypted in memory
        self.w3 = Web3(Web3.HTTPProvider(os.environ.get("ETH_HOST")))
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        try:
            with open(data_file, "r") as f:
                self.data = json.loads(f.read())
        except FileNotFoundError:
            self.data = dict()

    def get_accounts(self):
        res = dict()
        for i in list(self.data.keys()):
            res[i] = dict()
            if i in self.accounts:
                res[i]['state'] = "Unlocked"
            else:
                res[i]['state'] = "Locked"
            res[i]['balance'] = self.get_balance(i)
        return res


    def _generate_key_pair(self):
        field = SubGroup(self.p, self.g, self.n, self.h)
        curve = Curve(a = 0, b = 7, field = field, name = 'secp256k1')
        private_key = randint(1, self.n)
        public_key = private_key * curve.g
        public_key_hex = Web3.toHex(public_key.x)[2:] + Web3.toHex(public_key.y)[2:]
        return public_key_hex, private_key


    def _address_from_pub_key(self, public_key_hex):
        address = Web3.keccak(hexstr = public_key_hex).hex()
        address = "0x" + address[-40:]
        address = Web3.toChecksumAddress(address)
        return address

    def lock_account(self, public_key):
        res = self.accounts.pop(public_key, None)
        if res is None:
            return "Account {} is unknown or already locked".format(public_key)
        else:
            return "Successfully locked account {}".format(public_key)
    
    def create_new_account(self, password):
        public_key_hex, private_key = self._generate_key_pair()
        address = self._address_from_pub_key(public_key_hex)
        self.accounts[address] = private_key
        salt, iv, ct = self._encrypt_key_with_password(private_key, password)
        self.data[address] = {
            "salt": salt,
            "iv": iv,
            "ct": ct
        }

        self._write_data_to_file()
        print(f"Created new account")
        return address, private_key


    def upload_account(self, private_key, password):
        private_key = int(private_key,16)
        address = Account.from_key(private_key).address
        self.accounts[address] = private_key
        salt, iv, ct = self._encrypt_key_with_password(private_key, password)
        self.data[address] = {
            "salt": salt,
            "iv": iv,
            "ct": ct
        }
        self._write_data_to_file()


    def delete_account(self, public_key):
        if public_key not in self.data:
            return "Unknown account"
        del self.data[public_key]
        self.accounts.pop(public_key, None)
        self._write_data_to_file()
        return "Successfully deleted key"

    def get_account_by_password(self, key, password):
        try:
            private_key = self._decrypt_key_with_password(key, password)
        except KeyError:
            return "Key does not exist"
        except Exception:
            return "Wrong password"
        
        self.accounts[key] = private_key
        return "Unlocked"

    def get_private_key(self, public_key):
        try:
            return Web3.toHex(self.accounts[public_key])
        except KeyError:
            if public_key in self.data:
                return "Key is known but encrypted - Use unlock method and try again"
            else:
                return "Unknown key"

    def _encrypt_key_with_password(self, key, password):
        salt = get_random_bytes(16)
        enc_key = scrypt(password, salt, 32, N = 2**14, r = 8, p = 1)
        key = Web3.toHex(key)[2:]
        data = str(key).encode('utf-8')
        cipher = AES.new(enc_key, AES.MODE_CBC)
        ct_bytes = cipher.encrypt(pad(data, AES.block_size))
        salt = salt.hex()
        iv = cipher.iv.hex()
        ct = ct_bytes.hex()
        return salt, iv, ct

    def _decrypt_key_with_password(self, key, password):
        data = self.data[key]
        salt = data['salt']
        iv = data['iv'] 
        ct = data['ct']
        salt = bytes.fromhex(salt)
        iv = bytes.fromhex(iv)
        ct = bytes.fromhex(ct)

        enc_key = scrypt(password, salt, 32, N = 2**14, r = 8, p = 1)

        cipher = AES.new(enc_key, AES.MODE_CBC, iv)
        pt = unpad(cipher.decrypt(ct), AES.block_size).decode('utf-8')

        private_key = int(pt, 16)
        
        if Account.from_key(private_key).address != key:
            raise Exception("Wrong password")
        return private_key


    def _write_data_to_file(self):
        with open(self.data_file, "w") as f:
            f.write(json.dumps(self.data))

    def is_unlocked(self, account):
        return account in self.accounts

    def signTransaction(self, account, transaction):
        if account not in self.accounts:
            return "Unknown Account"
        
        account = self.w3.eth.account.privateKeyToAccount(self.accounts[account])
        return account.signTransaction(transaction)

    def create_w3_account(self, account):
        if account not in self.accounts:
            return "Unknown Account"
        return self.w3.eth.account.privateKeyToAccount(self.accounts[account])

    def get_balance(self, account):
        return self.w3.eth.get_balance(account)

if __name__ == "__main__":
    wal = EthWallet("/app/wallet/testDB")
    wal.create_new_account("abcd")

