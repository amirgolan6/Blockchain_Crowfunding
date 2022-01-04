import os

from client_contract_manager import ClientContractManager
from wallet.wallet import EthWallet
from server_utilities import get_list, get_info, new_fund, end_fund

from flask import Flask, request, json, jsonify, make_response, render_template, url_for
from flask_swagger_ui import get_swaggerui_blueprint
from datetime import datetime


wallet = EthWallet(os.environ['WALLET_DB'])

contract_manager = ClientContractManager()
app = Flask(__name__)


### swagger specific ###
SWAGGER_URL = '/api'
API_URL = '/static/swagger.yml'
SWAGGERUI_BLUEPRINT = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Etherium Crowdfunding - Amir Golan"
    }
)
app.register_blueprint(SWAGGERUI_BLUEPRINT, url_prefix=SWAGGER_URL)
### end swagger specific ###


def verify_public_key_syntax(public_key):
    if public_key is None:
        return None
    if public_key.startswith('0x') and len(public_key) == 42:
        int(public_key[2:], 16) # check valid byte string
        return public_key
    elif public_key.startswith('0X') and len(public_key) == 42:
        int(public_key[2:], 16) # check valid byte string
        return public_key.replace("0X", '0x')
    elif len(public_key) == 40:
        int(public_key, 16) # check valid byte string
        return '0x' + public_key
    else:
        return None

def verify_private_key_syntax(key):
    if key is None:
        return None
    if key.startswith('0x') and len(key) == 66:
        int(key[2:], 16) # check valid byte string
        return key
    elif key.startswith('0X') and len(key) == 66:
        int(key[2:], 16) # check valid byte string
        return key.replace("0X", '0x')
    elif len(key) == 64:
        int(key, 16) # check valid byte string
        return '0x' + key
    else:
        return None

@app.route("/", methods=['GET'])
def hello():
    with open("/app/static/index2.html", "r") as f:
        return f.read()
    #return render_template('index.html')

@app.route("/script.js", methods=['GET'])
def get_script():
    with open("/app/static/script.js", "r") as f:
        return f.read()

################################################################################
################################################################################
######               Account related routes:                       #############
################################################################################
################################################################################

@app.route("/api/account/create/", methods=['POST'])
def create_account():
    try:
        password = request.args.get('password').strip()
        print("Creating account with password {}".format(password), flush=True)
        public_key, private_key = wallet.create_new_account(password)

        return jsonify({
            "result": "success",
            "public_key": public_key
        })
    except Exception as e:
        print(str(e), flush=True)
        return jsonify({
            "result": "fail",
            "reason": str(e)
        })

@app.route("/api/account/list", methods=['GET'])
def get_accounts():
    try:
        print("Getting all accounts", flush=True)
        accounts = wallet.get_accounts()
        print(accounts, flush=True)
        return jsonify(accounts)
    except Exception as e:
        print(str(e), flush=True)
        return jsonify({
            "result": "fail",
            "reason": str(e)
        })

@app.route("/api/account/unlock", methods=['POST'])
def unlock_account():
    try:
        password = request.args.get('password').strip()
        public_key = request.args.get('account').strip()
        public_key = verify_public_key_syntax(public_key)
        if public_key is None:
            print("Invalid public key", flush=True)
            return make_response(jsonify({
                "result": "fail",
                "reason": "Invalid public key"
            }), 404)
        print("Unlocking public key", flush=True)
        res = wallet.get_account_by_password(public_key, password)
        if res == "Wrong password":
            return make_response(jsonify({
                "result": "fail",
                "reason": "Wrong password"
            }), 404)
        elif res == "Unlocked":
            return jsonify({
                "result": res
            })
        else:
            return make_response(jsonify({
                "result": "fail",
                "reason": "unknown"
            }),
            500)
        
    except Exception as e:
        print(str(e), flush=True)
        return make_response(jsonify({
            "result": "fail",
            "reason": str(e)
        }),
        500)

@app.route("/api/account/add", methods=['POST'])
def add_account():
    try:
        password = request.args.get('password').strip()
        private_key = request.args.get('private_key').strip()
        private_key = verify_private_key_syntax(private_key)
        if private_key is None:
            print("Invalid private key", flush=True)
            return make_response(jsonify({
                "result": "fail",
                "reason": "Invalid private key"
            }), 404)
        print("Adding private key", flush=True)
        res = wallet.upload_account(private_key, password)
        return make_response(jsonify({
            "result": "success"
        }),
        500)
        
    except Exception as e:
        print(str(e), flush=True)
        return make_response(jsonify({
            "result": "fail",
            "reason": str(e)
        }),
        500)

@app.route("/api/account/lock", methods=['POST'])
def lock_account():
    try:
        public_key = request.args.get('public_key').strip()
        public_key = verify_public_key_syntax(public_key)
        if public_key is None:
            print("Invalid public key", flush=True)
            return make_response(jsonify({
                "result": "fail",
                "reason": "Invalid public key"
            }), 404)
        print("Locking public key (Only owner of password will be able to use it)", flush=True)
        res = wallet.lock_account(public_key)
        return jsonify({
            "result": res
        })
        
    except Exception as e:
        print(str(e), flush=True)
        return make_response(jsonify({
            "result": "fail",
            "reason": str(e)
        }),
        500)

@app.route("/api/account/private-key", methods = ['GET'])
def get_private_key():
    try:
        public_key = request.args.get('account').strip()
        public_key = verify_public_key_syntax(public_key)
        if public_key is None:
            print("Invalid public key", flush=True)
            return make_response(jsonify({
                "result": "fail",
                "reason": "Invalid public key"
            }), 404)
        print("Getting private key for public key {}".format(public_key), flush=True)
        res = wallet.get_private_key(public_key)
        return jsonify({
            "result": res
        })
        
    except Exception as e:
        print(str(e), flush=True)
        return make_response(jsonify({
            "result": "fail",
            "reason": str(e)
        }),
        500)

@app.route("/api/account/delete", methods=['DELETE'])
def delete_account():
    try:
        public_key = request.args.get('public_key').strip()
        public_key = verify_public_key_syntax(public_key)
        if public_key is None:
            print("Invalid public key", flush=True)
            return make_response(jsonify({
                "result": "fail",
                "reason": "Invalid public key"
            }), 404)
        print("Deleting key", flush=True)
        res = wallet.delete_account(public_key)
        return jsonify({
            "result": res
        })
        
    except Exception as e:
        print(str(e), flush=True)
        return make_response(jsonify({
            "result": "fail",
            "reason": str(e)
        }),
        500)

@app.route("/api/account/get_balance", methods=['GET'])
def get_account_balance():
    try:
        try:
            account = request.args.get('account').strip()
            account = verify_public_key_syntax(account)
        except (ValueError, TypeError):
            return jsonify({
                "result": "fail",
                "reson": "Params account is invalid"
            })
        if account is None:
            print("Invalid public key", flush=True)
            return make_response(jsonify({
                "result": "fail",
                "reason": "Invalid public key"
            }), 404)
        print("Getting balance", flush=True)
        res = wallet.get_balance(account)
        return jsonify({
            "result": "success",
            "balance": res
        })
        
    except Exception as e:
        print(str(e), flush=True)
        return make_response(jsonify({
            "result": "fail",
            "reason": str(e)
        }),
        500)


################################################################################
################################################################################
######               Fundraiser related routes:                    #############
################################################################################
################################################################################

@app.route("/api/campaign/check_server", methods=['GET'])
def check_server_availability():
    try:
        #res = manager_client.get_list()
        res = get_list()
        return jsonify(json.loads(res))
    except Exception as e:
        print(str(e), flush=True)
        return make_response(jsonify({
            "result": "fail",
            "reason": str(e)
        }),
        500)

@app.route("/api/campaign/create", methods=['POST'])
def create_new_fund():
    try:
        account = verify_public_key_syntax(request.args.get('account').strip())
        owner1 = verify_public_key_syntax(request.args.get('owner1').strip())
        owner2 = verify_public_key_syntax(request.args.get('owner2').strip())
        owner3 = verify_public_key_syntax(request.args.get('owner3').strip())
    except (ValueError, TypeError):
        return jsonify({
            "result": "fail",
            "reson": "Params account, owner1, owner2 and owner3 not included or invalid"
        })
    try:
        name = request.args.get("name")
        description = request.args.get("description")
    except ValueError:
        return jsonify({
            "result": "fail",
            "reason": "Missing required params name or description"
        })
    try:
        goal = int(request.args.get("goal").strip())
        expires = datetime.strptime(request.args.get("expires").strip(), "%Y/%m/%d, %H:%M:%S")
    except (ValueError, TypeError) as e:
        print(str(e),flush=True)
        return jsonify({
            "result": "fail",
            "reason": "Missing required params goal or expires"
        })
    #except check int and datetime don't fail

    if owner1.lower() == owner2.lower() or owner2.lower() == owner3.lower() or owner3.lower() == owner1.lower():
        return jsonify({
            "result": "fail",
            "reason": "All 3 owners must be different"
        })

    return jsonify(contract_manager.createNewFundContract(account, owner1, owner2, owner3, goal, name, description, expires, wallet))


@app.route("/api/campaign/info", methods=['GET'])
def get_fund_info():
    try:
        try:
            address = verify_public_key_syntax(request.args.get('address').strip())
        except (ValueError, TypeError):
            return jsonify({
                "result": "fail",
                "reason": "Missing or invalid Fund Address"
            })
        if address is None:
            print("Invalid public key", flush=True)
            return jsonify({
                "result": "fail",
                "reason": "Invalid public key"
            })
        try:
            res = json.loads(get_info(address))
        except Exception as e:
            res = {
                "address": address
            }
        
        try:
            cur_fund = contract_manager.get_fund_status(address)
            res["live_stats"] = cur_fund
            res["on_blockchain"] = True
            
        except Exception as e:
            print(str(e),flush=True)
            res["on_blockchain"] = False
        
        print(res,flush=True)
        return jsonify(res)
    except Exception as e:
        print(str(e), flush=True)
        return make_response(jsonify({
            "result": "fail",
            "reason": str(e)
        }),
        500)

@app.route("/api/campaign/list", methods=['GET'])
def get_all_fundraisers():
    try:
        #res = manager_client.get_list()
        res = get_list()
        return jsonify(json.loads(res))
    except Exception as e:
        print(str(e), flush=True)
        return make_response(jsonify({
            "result": "fail",
            "reason": str(e)
        }),
        500)

@app.route("/api/campaign/fund", methods=['POST'])
def send_funds():
    try:
        account = verify_public_key_syntax(request.args.get('account').strip())
        fund_address = verify_public_key_syntax(request.args.get('fund_address').strip())
    except (ValueError, TypeError):
        return jsonify({
            "result": "fail",
            "reason": "Params account, campaign address must be valid addresses"
        })
    if account is None or fund_address is None:
        return jsonify({
            "result": "fail",
            "reason": "Params account, campaign address must be valid addresses"
        })
    try:
        amount = int(request.args.get('amount').strip())
    except (ValueError, TypeError):
        return jsonify({
            "result": "fail",
            "reason": "Please specify amount in wei"
        })
    return jsonify(contract_manager.fund_campaign(fund_address, amount, account, wallet))

@app.route("/api/campaign/withdraw", methods=['POST'])
def withdraw():
    try:
        account = verify_public_key_syntax(request.args.get('account').strip())
        fund_address = verify_public_key_syntax(request.args.get('fund_address').strip())
        dest_account = verify_public_key_syntax(request.args.get('dest_account').strip())
    except (ValueError, TypeError):
        return jsonify({
            "result": "fail",
            "reason": "Params account, fund_address, dest_account must be valid addresses"
        })
    if account is None or fund_address is None:
        return jsonify({
            "result": "fail",
            "reason": "Params account, fund_address, dest_account must be valid addresses"
        })
    second_sig = request.args.get('secondSignature')
    if second_sig is None:
        return jsonify({
            "result": "fail",
            "reason": "Param secondSignature is requires"
        })
    res = contract_manager.withdraw(fund_address, dest_account, account, second_sig, wallet)

    return jsonify(res)


@app.route("/api/campaign/signwithdrawal", methods=["POST"])
def sign_withdrawal():
    try:
        account = verify_public_key_syntax(request.args.get('account').strip())
        fund_address = verify_public_key_syntax(request.args.get('fund_address').strip())
        dest_account = verify_public_key_syntax(request.args.get('dest_account').strip())
    except (ValueError, TypeError):
        return jsonify({
            "result": "fail",
            "reason": "Params account, fund_address, dest_account must be valid addresses"
        })
    if account is None or fund_address is None:
        return jsonify({
            "result": "fail",
            "reason": "Params account, fund_address, dest_account must be valid addresses"
        })
    return jsonify(contract_manager.create_signature(fund_address, dest_account, account, wallet))

@app.route("/api/campaign/refund", methods=['POST'])
def refund():
    try:
        account = verify_public_key_syntax(request.args.get('account').strip())
        fund_address = verify_public_key_syntax(request.args.get('fund_address').strip())
    except (ValueError, TypeError):
        return jsonify({
            "result": "fail",
            "reason": "Params account, fund_address must be valid addresses"
        })
    if account is None or fund_address is None:
        return jsonify({
            "result": "fail",
            "reason": "Params account, fund_address must be valid addresses"
        })
    return jsonify(contract_manager.refund(fund_address, account, wallet))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)

