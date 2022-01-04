from flask import Flask, request, json, jsonify
from flask_swagger_ui import get_swaggerui_blueprint
from datetime import datetime
from server_contract_manager import ServerContractManager
from db_manager import DB

contract_manager = ServerContractManager()

app = Flask(__name__)

db = DB()

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



@app.route("/api/campaign/list", methods=["GET"])
def get_campaigns():
    return jsonify(db.get_campaigns())

@app.route("/api/campaign/info", methods=["GET"])
def get_campaign_info():
    try:
        fundAddress = verify_public_key_syntax(request.args.get('address'))[2:]
    except (ValueError, TypeError):
        return jsonify({
            "result": "Missing or invalid Fund Address"
        })
    if fundAddress is None:
        return jsonify({
            "result": "Missing or invalid Fund Address"
        })
    res = db.get_campaign_info(fundAddress)
    return jsonify(res)


@app.route("/api/campaign/create", methods=["POST"])
def create_campagin():
    try:
        owner1 = verify_public_key_syntax(request.args.get('owner1'))[2:]
        owner2 = verify_public_key_syntax(request.args.get('owner2'))[2:]
        owner3 = verify_public_key_syntax(request.args.get('owner3'))[2:]
    except (ValueError, TypeError):
        return jsonify({
            "result": "Params owner1, owner2 and owner3 not included or invalid"
        })
    try:
        address = verify_public_key_syntax(request.args.get('address'))[2:]
    except (ValueError, TypeError):
        return jsonify({
            "result": "Params must include a valid address"
        })
    try:
        name = request.args.get("name")
        description = request.args.get("description")
    except ValueError:
        return jsonify({
            "result": "Missing required params name or description"
        })

    # need to read goal and expires from block chain and verify other parameters.
    try:
        data_from_blockchain = contract_manager.get_fund_status('0x' + address)
    except Exception as e:
        print(str(e), flush=True)
        return jsonify({
            "result": "fail",
            "reason": str(e)
        })
    expires = data_from_blockchain["expires"]
    goal = data_from_blockchain["goal"]
    res = db.add_campaign(name, description, expires, goal, address, owner1, owner2, owner3)
    return jsonify({
        "result": res
    })

@app.route("/api/campaign/end", methods=["POST"])
def end_fund():
    try:
        dest_account = verify_public_key_syntax(request.args.get('dest_account'))[2:]
    except (ValueError, TypeError):
        return jsonify({
            "result": "Param dest_account not included or invalid"
        })
    try:
        dest_account = verify_public_key_syntax(request.args.get('address'))[2:]
    except (ValueError, TypeError):
        return jsonify({
            "result": "Param dest_account not included or invalid"
        })
    try:
        final_balance = int(request.args.get("final_balance"))
        address =  verify_public_key_syntax(request.args.get("address"))[2:]
    except ValueError:
        return jsonify({
            "result": "Missing required params address or final_balance"
        })

    # Verify contract has been withdrawan expect to except
    try:
        data_from_blockchain = contract_manager.get_fund_status('0x' + address)
        return jsonify({
            "result": "fail",
            "reason": "Contract is still active"
        })
    except Exception as e:
        # This means the contract really doens't exist
        print("Ending Fund {}".format(address), flush=True)
        db.end_campaign(address, dest_account, final_balance)
    
    return jsonify({
        "result": "success"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=False)

