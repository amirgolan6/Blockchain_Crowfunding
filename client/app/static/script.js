
function listWallet() {
    var apiUrl = '/api/account/list';
    fetch(apiUrl).then(response => {
        return response.json();
    }).then(data => {
        var table = document.createElement('table');
        let thead = table.createTHead();
        let row = thead.insertRow();
        for (let key of ['Account','State', 'Wei Balance', 'Eth Balance']) {
            let th = document.createElement("th");
            let text = document.createTextNode(key);
            th.appendChild(text);
            row.appendChild(th);
        }
        for(let key of Object.keys(data)) {
            let row = table.insertRow();
            element = data[key];
            
            let cell = row.insertCell();
            let text = document.createTextNode(key);
            cell.appendChild(text);

            cell = row.insertCell();
            text = document.createTextNode(element['state']);
            cell.appendChild(text);

            cell = row.insertCell();
            text = document.createTextNode(element['balance']);
            cell.appendChild(text);

            cell = row.insertCell();
            text = document.createTextNode(wei_to_eth(BigInt(element['balance'])));
            cell.appendChild(text);

        }
        document.getElementById('known_accounts').innerHTML = '';
        document.getElementById('known_accounts').appendChild(table);
    }).catch(err => {
        console.log("err");
        console.log(err);
    });
  }

  function createAccount() {
    var password = document.getElementById("new_password").value;
    var apiUrl = new URL('/api/account/create/', document.baseURI),
    params = {
        password: password
    }
    apiUrl.search = new URLSearchParams(params).toString();
    document.getElementById('new_created_account').innerHTML = "Creating account...";
    fetch(apiUrl, {
        method: 'POST'
    }).then(response => {
        return response.json();
    }).then(data => {
        // Work with JSON data here
        console.log(data);
        document.getElementById('new_created_account').innerHTML = "New account created and saved: " + data["public_key"];
        listWallet()
    }).catch(err => {
        console.log("err");
        console.log(err);
    });
}

function addAccount() {
    var password = document.getElementById("add_account_new_password").value;
    var private_key = document.getElementById("add_account_private_key").value;
    var apiUrl = new URL('/api/account/add', document.baseURI),
    params = {
        password: password,
        private_key: private_key
    }
    apiUrl.search = new URLSearchParams(params).toString();
    document.getElementById('new_created_added').innerHTML = "Adding account...";
    fetch(apiUrl, {
        method: 'POST'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid private key"){
                document.getElementById('new_created_added').innerHTML = "Invalid private key";
            } else {
                document.getElementById('account_deleted').innerHTML = "Unknown error: " + data["reason"];
            }
        } else {
            console.log(data);
            document.getElementById('new_created_added').innerHTML = "Account added and saved";
            listWallet()
        }
        
    }).catch(err => {
        console.log("err");
        console.log(err);
    });
}

function deleteAccount() {
    var account = document.getElementById("delete_account").value;
    var apiUrl = new URL('/api/account/delete', document.baseURI),
    params = {
        public_key: account
    }
    apiUrl.search = new URLSearchParams(params).toString();
    document.getElementById('account_deleted').innerHTML = "Deleting account...";
    fetch(apiUrl, {
        method: 'DELETE'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('account_deleted').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('account_deleted').innerHTML = "Unknown error: " + data["reason"];
            }
        } else {
            document.getElementById('account_deleted').innerHTML = "Account deleted";
            listWallet()
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('account_deleted').innerHTML = "Account invalid or doesn't exist";
        }
    });
}

function getAccountBalance() {
    var account = document.getElementById("get_balance_account").value;
    var apiUrl = new URL('/api/account/get_balance', document.baseURI),
    params = {
        account: account
    }
    apiUrl.search = new URLSearchParams(params).toString();
    document.getElementById('account_balance').innerHTML = "Getting account balance...";
    fetch(apiUrl, {
        method: 'GET'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('account_balance').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('account_balance').innerHTML = "Unknown error: " + data["reason"];
            }
        } else {
            res = "Account balance is " + data['balance'] + " wei";
            var num = BigInt(data['balance'])
            // num /= 1000000000000000000n
            num = wei_to_eth(num);
            res += " or " + num + " eth"
            document.getElementById('account_balance').innerHTML = res;
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('account_balance').innerHTML = "Account invalid or doesn't exist";
        }
    });
}

function wei_to_eth(num) {
    return Number(num * 100000n / 1000000000000000000n) / 100000
}

function lockAccount() {
    var account = document.getElementById("lock_account").value;
    var apiUrl = new URL('/api/account/lock', document.baseURI),
    params = {
        public_key: account
    }
    apiUrl.search = new URLSearchParams(params).toString();
    document.getElementById('account_locked').innerHTML = "Locking account...";
    fetch(apiUrl, {
        method: 'POST'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('account_locked').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('account_locked').innerHTML = "Unknown error: " + data["reason"];
            }
        } else {
            document.getElementById('account_locked').innerHTML = "Account locked";
            listWallet()
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('account_locked').innerHTML = "Account invalid or doesn't exist";
        }
    });
}

function unlockAccount() {
    var account = document.getElementById("unlock_account").value;
    var password = document.getElementById("unlock_account_password").value;
    var apiUrl = new URL('/api/account/unlock', document.baseURI),
    params = {
        account: account,
        password: password
    }
    apiUrl.search = new URLSearchParams(params).toString();
    document.getElementById('account_unlocked').innerHTML = "Unlocking account...";
    fetch(apiUrl, {
        method: 'POST'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('account_unlocked').innerHTML = "Account invalid or doesn't exist";
            } else if (data["reason"] == "Wrong password") {
                document.getElementById('account_unlocked').innerHTML = "Password is wrong";
            } else {
                document.getElementById('account_unlocked').innerHTML = "Unknown error: " + data["reason"];
            }
        } else {
            document.getElementById('account_unlocked').innerHTML = "Account unlocked";
            listWallet()
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('account_unlocked').innerHTML = "Account invalid or doesn't exist";
        }
    });
}

function getPrivateKey() {
    var account = document.getElementById("private_key_account").value;
    var apiUrl = new URL('/api/account/private-key', document.baseURI),
    params = {
        account: account
    }
    apiUrl.search = new URLSearchParams(params).toString();
    document.getElementById('private_key').innerHTML = "Locking account...";
    fetch(apiUrl, {
        method: 'GET'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('private_key').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('private_key').innerHTML = "Unknown error: " + data["reason"];
            }
        } else {
            document.getElementById('private_key').innerHTML = data['result'];
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('private_key').innerHTML = "Account invalid or doesn't exist";
        }
    });
}

function listFunds() {
    var apiUrl = '/api/campaign/list';
    fetch(apiUrl).then(response => {
        return response.json();
    }).then(data => {
        if (data.result == "fail") {
            document.getElementById('known_funds').innerHTML = 'Failed to retreive known funds from server';
        } else {
            document.getElementById('current_fund').innerHTML = '';
            document.getElementById("current_fund").style.display = 'none';
            var table = document.createElement("table");
            // table.style.display = 'block';
            document.getElementById('known_funds').style.display = 'block';
            let thead = table.createTHead();
            let row = thead.insertRow();
            console.log(data)
            if (data.length == 0) {
                table.innerHTML = "No known Funds"
            }else{
                let th = document.createElement("th");
                let text = document.createTextNode("");
                th.appendChild(text);
                row.appendChild(th);
                for (let key of Object.keys(data[0])) {
                    let th = document.createElement("th");
                    let text = document.createTextNode(key);
                    th.appendChild(text);
                    row.appendChild(th);
                }
                for(var i = 0; i < Object.keys(data).length; i++) {
                    let row = table.insertRow();
                    element = data[i];
                    let cell = row.insertCell();
                    var button = document.createElement("button");
                    button.setAttribute("contract", element["address"]);
                    button.setAttribute("onclick", "selectFund(this.getAttribute(\"contract\"))");
                    button.innerHTML = "Select";
                    cell.appendChild(button);
                    for (key in element) {
                        let cell = row.insertCell();
                        let text = document.createTextNode(element[key]);
                        if (key == 'goal') {
                            text = document.createTextNode(BigInt(element[key]) + " wei");
                        }
                        cell.appendChild(text);
                    }
                }
            }
            document.getElementById('known_funds').innerHTML = '';
            document.getElementById('known_funds').appendChild(table);
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
    });
  }

function selectFund(clicked_id) {
    console.log(clicked_id);
    HideKnownFunds()
    getFundInfo(clicked_id);
}

function getFundInfo(address) {
    var unreg = false;
    if (address == 'unreg'){
        unreg = true;
        address = document.getElementById("unreg_fund_fund_address").value.trim();
        if (!is_address(address)){
            document.getElementById('unred_fund_get_fund_result').innerHTML = "Invalid address. The address should be a contract address on the blockchain";
            return;
        }
        document.getElementById('unred_fund_get_fund_result').innerHTML = "Getting data from blockchain";
    }
    var apiUrl = new URL('/api/campaign/info', document.baseURI),
    params = {
        address: address
    }
    apiUrl.search = new URLSearchParams(params).toString();
    fetch(apiUrl).then(response => {
        return response.json();
    }).then(data => {
        if (unreg && data['on_blockchain'] == false) {
            document.getElementById('unred_fund_get_fund_result').innerHTML = "Invalid address. The address should be a contract address on the blockchain";
            return;
        }
        var table = document.createElement("table");
        let thead = table.createTHead();
        let row = thead.insertRow();

        let th = document.createElement("th");
        let text = document.createTextNode("");
        th.appendChild(text);
        row.appendChild(th);
        for (let key of ["Address", "Expires", "Goal", "Name"]) {
            let th = document.createElement("th");
            let text = document.createTextNode(key);
            th.appendChild(text);
            row.appendChild(th);
        }
        row = table.insertRow();
        let cell = row.insertCell();
        var button = document.createElement("button");
        button.setAttribute("onclick", "closeFund()");
        button.innerHTML = "Close Fund";
        cell.appendChild(button);
        cell = row.insertCell();
        text = document.createTextNode(data['address']);
        cell.appendChild(text);
        cell = row.insertCell();
        if (data.ended){
            text = document.createTextNode(data["expires"]);
        } else{
            text = document.createTextNode(data["live_stats"]["expires"]);
        }
        cell.appendChild(text);
        cell = row.insertCell();
        if (data.ended){
            text = document.createTextNode(BigInt(data["goal"]) + " ether");
        } else{
            text = document.createTextNode(BigInt(data["live_stats"]["goal"]) + " ether");
        }
        cell.appendChild(text);
        cell = row.insertCell();
        if (unreg){
            text = document.createTextNode("NA");
        } else{
            text = document.createTextNode(data["name"]);
        }
        cell.appendChild(text);

        document.getElementById('current_fund').innerHTML = '';
        document.getElementById("current_fund").style.display = 'block';
        document.getElementById('current_fund').appendChild(table);


        // Add description:
        let d = document.createElement("h3");
        d.innerHTML = "Campaign Description:";
        document.getElementById('current_fund').appendChild(d);
        p = document.createElement("p");
        if (unreg){
            p.innerHTML = "NA";
        } else{
            p.innerHTML = data["description"];
        }
        document.getElementById('current_fund').appendChild(p);
        
        d = document.createElement("h3");
        d.innerHTML = "Campaign Owners:";
        document.getElementById('current_fund').appendChild(d);
        
        if (unreg){
            p = document.createElement("p");
            p.innerHTML = "NA";
            document.getElementById('current_fund').appendChild(p);
        } else{
            p = document.createElement("p");
            p.innerHTML = data["owner1"];
            document.getElementById('current_fund').appendChild(p);
            p = document.createElement("p");
            p.innerHTML = data["owner2"];
            document.getElementById('current_fund').appendChild(p);
            p = document.createElement("p");
            p.innerHTML = data["owner3"];
            document.getElementById('current_fund').appendChild(p);
        }

        let cur_state;
        if (!unreg){
            if (data["ended"]) {
                cur_state = "Fund Raiser is over with " + wei_to_eth(BigInt(data["final"])) + " wei funded, funds have been withdrawn to account " + data["dest_account"]; 
            } else {
                if (data["live_stats"]["expired"]) {
                    cur_state = "Campaign funding is over, ";
                    if (data.live_stats.goal_reached) {
                        cur_state += "goal has been reached";
                        if (data.live_stats.funds_withdrawn) {
                            cur_state += " and funds have been withdrawn.";
                        } else {
                            cur_state += " but funds have not yet been withdrawn."
                            cur_state += " Balance: " + wei_to_eth(BigInt(data.live_stats.balance)) + " Ether.";
                        }
                    } else{
                        cur_state += "goal has not been reached.";
                    }
                } else {
                    cur_state = "Current Funds:\n" + BigInt(data.live_stats.balance) + " wei =~ " + wei_to_eth(BigInt(data.live_stats.balance)) + " Ether.\n" + (data.live_stats.balance / data.goal * 100).toFixed()+ "% of goal" 
                }
            }
        } else {
            if (data['live_stats']['funds_withdrawn']){
                cur_state = "Fund Raiser is over, it has reached it's goal and funds were withdrawn to an authorized account";
            } else {
                if (data["live_stats"]["expired"]) {
                    cur_state = "Campaign funding is over, ";
                    if (data.live_stats.goal_reached) {
                        cur_state += "goal has been reached";
                        if (data.live_stats.funds_withdrawn) {
                            cur_state += " and funds have been withdrawn.";
                        } else {
                            cur_state += " but funds have not yet been withdrawn."
                        }
                    } else{
                        cur_state += "goal has not been reached.";
                    }
                } else {
                    cur_state = "Current Funds:\n: " + data.live_stats.balance + ".\n" + data.live_stats.balance / data.live_stats.goal * 100+ "% of goal." 
                }
            }
        }
        d = document.createElement("h3");
        d.innerHTML = "Campaign State:";
        document.getElementById('current_fund').appendChild(d);
        p = document.createElement("p");
        p.innerHTML = cur_state;
        document.getElementById('current_fund').appendChild(p);

        // Create action buttons for fund:
        form = document.createElement('form')
        form.setAttribute("class", "fund_buttons")
        d = document.createElement("h3");
        d.innerHTML = "Actions:";
        document.getElementById('current_fund').appendChild(d);
        if (data.live_stats.expired == false) {
            let div = document.createElement('div')
            div.setAttribute("format_type", "boxed");

            let h2 = document.createElement('h2');
            h2.setAttribute('type', 'OpHeader');
            h2.innerHTML = 'Send Donation';
            div.appendChild(h2);

            let label =document.createElement('label');
            label.innerHTML = "Amount:";
            label.setAttribute("type", "type2");
            div.appendChild(label)


            let input = document.createElement('input')
            input.id = 'fundAmount';
            input.placeholder = '0';
            input.type = "text";
            input.setAttribute("format_type", "text_left");
            div.appendChild(input)

            
            let select = document.createElement('select');
            select.type = 'right';
            select.id = 'fundCurrency';
            for (let key of ['wei', 'gwei', 'finney', 'ether']) {
                option = document.createElement('option');
                option.innerHTML = key;
                option.value = key;
                select.appendChild(option);
            }
            div.appendChild(select);

            label =document.createElement('label');
            label.setAttribute("type", "type2");
            label.innerHTML = "Using Account: ";
            div.appendChild(label)

            input = document.createElement('input')
            input.id = 'send_fund_account';
            input.type = "text";
            input.placeholder = '0x...';
            div.appendChild(input)

            label = document.createElement("label");
            label.innerHTML = "";
            label.setAttribute("type", "type2");
            label.setAttribute("id", "donate_result");
            div.appendChild(label);

            let b = document.createElement('button');
            b.setAttribute("contract", data["address"]);
            b.type = "button";
            b.setAttribute("onclick", "SendDonation(this.getAttribute(\"contract\"))");
            b.setAttribute("format_type", "submit_create_fund");
            b.innerHTML = "Donate";
            div.appendChild(b);

            form.appendChild(div);
        }
        if (data.live_stats.expired == true && data.live_stats.goal_reached == false) {
            let div = document.createElement('div')
            div.setAttribute("format_type", "boxed");

            let h2 = document.createElement('h2');
            h2.setAttribute('type', 'OpHeader');
            h2.innerHTML = 'Get Refund';
            div.appendChild(h2);

            let label = document.createElement('label');
            label.innerHTML = "Account: ";
            label.type = "type2";
            div.appendChild(label)
            let input = document.createElement('input')
            input.id = 'get_refund_account';
            input.placeholder = '0x...';
            input.type = "text";
            div.appendChild(input)

            label = document.createElement("label");
            label.innerHTML = "";
            label.type = "type2";
            label.setAttribute("id", "refund_result");
            div.appendChild(label);

            let b = document.createElement('button');
            b.type = "button";
            b.setAttribute("contract", data["address"]);
            b.setAttribute("onclick", "Refund(this.getAttribute(\"contract\"))");
            b.setAttribute("format_type", "submit_create_fund");
            b.innerHTML = "Get Refund";
            div.appendChild(b);

            form.appendChild(div);
        }
        if (data.live_stats.expired == true && data.live_stats.goal_reached == true && data.live_stats.funds_withdrawn == false) {
            let div = document.createElement('div')
            div.setAttribute("format_type", "boxed");

            let h2 = document.createElement('h2');
            h2.setAttribute('type', 'OpHeader');
            h2.innerHTML = 'Withdraw with two local accounts';
            div.appendChild(h2);

            let label = document.createElement('label');
            label.innerHTML = "Account for withdrawal: ";
            label.type = "type2";
            div.appendChild(label)
            let input = document.createElement('input')
            input.type = "text";
            input.id = 'withdraw_two_accounts_account_for_withdrawal';
            input.placeholder = '0x...';
            div.appendChild(input)

            label = document.createElement('label');
            label.type = "type2";
            label.innerHTML = "Authorized Account 1: (This account will be charged the gas of the transaction)";
            div.appendChild(label)
            input = document.createElement('input')
            input.type = "text"
            input.id = 'two_account_authroized_account_1';
            input.placeholder = '0x...';
            div.appendChild(input)

            label = document.createElement('label');
            label.type = "type2";
            label.innerHTML = "Authorized Account 2: ";
            div.appendChild(label)
            input = document.createElement('input')
            input.type = "text"
            input.id = 'two_account_authroized_account_2';
            input.placeholder = '0x...';
            div.appendChild(input)

            let b = document.createElement('button');
            b.type = "button";
            b.setAttribute("contract", data["address"]);
            b.setAttribute("onclick", "WithdrawTwoAccounts(this.getAttribute(\"contract\"))");
            b.setAttribute("format_type", "submit_create_fund");
            b.innerHTML = "Withdraw Funds Using Two Authorized Accounts";
            div.appendChild(b);

            label = document.createElement('label');
            label.type = "type2";
            label.innerHTML = "";
            label.setAttribute("id", "withdraw_two_accounts_result");
            div.appendChild(label)

            form.appendChild(div);
        }
        if (data.live_stats.expired == true && data.live_stats.goal_reached == true && data.live_stats.funds_withdrawn == false) {
            let div = document.createElement('div')
            div.setAttribute("format_type", "boxed");

            let h2 = document.createElement('h2');
            h2.setAttribute('type', 'OpHeader');
            h2.innerHTML = 'Withdraw with account and signature';
            div.appendChild(h2);

            let label = document.createElement('label');
            label.innerHTML = "Account for withdrawal: ";
            label.type = "type2";
            div.appendChild(label)
            let input = document.createElement('input')
            input.type = "text"
            input.id = 'withdraw_account_and_sig_account_for_withdrawal';
            input.placeholder = '0x...';
            div.appendChild(input)

            label = document.createElement('label');
            label.type = "type2";
            label.innerHTML = "Authorized Account 1: (This account will be charged the gas of the transaction)";
            div.appendChild(label)
            input = document.createElement('input')
            input.type = "text";
            input.id = 'account_and_sig_authroized_account_1';
            input.placeholder = '0x...';
            div.appendChild(input);

            label = document.createElement('label');
            label.type = "type2";
            label.innerHTML = "Signature from Second Account";
            div.appendChild(label);
            input = document.createElement('input')
            input.type = "text";
            input.id = 'account_and_sig_signature_withdrawal';
            input.placeholder = '0x...';
            div.appendChild(input)

            let b = document.createElement('button');
            b.type = "button";
            b.setAttribute("contract", data["address"]);
            b.setAttribute("onclick", "WithdrawAccountAndSig(this.getAttribute(\"contract\"))");
            b.setAttribute("format_type", "submit_create_fund");
            b.innerHTML = "Withdraw Funds Using An Authorized Account and a Signature";
            div.appendChild(b);

            label = document.createElement('label');
            label.type = "type2";
            label.innerHTML = "";
            label.setAttribute("id", "withdraw_account_and_sig_result");
            div.appendChild(label)

            form.appendChild(div);
        }
        if (data.live_stats.expired == true && data.live_stats.goal_reached == true && data.live_stats.funds_withdrawn == false) {
            let div = document.createElement('div')
            div.setAttribute("format_type", "boxed");

            let h2 = document.createElement('h2');
            h2.setAttribute('type', 'OpHeader');
            h2.innerHTML = 'Generate signature for withdrawal';
            div.appendChild(h2);

            let label = document.createElement('label');
            label.type = "type2";
            label.innerHTML = "Account for withdrawal: ";
            div.appendChild(label)
            let input = document.createElement('input')
            input.type = "text";
            input.id = 'generate_sig_account_for_withdrawal';
            input.placeholder = '0x...';
            div.appendChild(input)

            label = document.createElement('label');
            label.type = "type2";
            label.innerHTML = "Authorized Account:";
            div.appendChild(label)
            input = document.createElement('input')
            input.type = "text";
            input.id = 'generate_sig_authroized_account';
            input.placeholder = '0x...';
            div.appendChild(input)

            let b = document.createElement('button');
            b.type = "button";
            b.setAttribute("contract", data["address"]);
            b.setAttribute("onclick", "GenerateSigForWithdrawal(this.getAttribute(\"contract\"))");
            b.setAttribute("format_type", "submit_create_fund");
            b.innerHTML = "Generate Withdrawal Signature";
            div.appendChild(b);

            label = document.createElement('label');
            label.type = "type2";
            label.innerHTML = "";
            label.setAttribute("id", "generate_signature_result");
            div.appendChild(label)

            form.appendChild(div);
        }
        if (!unreg) {
            document.getElementById('current_fund').appendChild(form);
        } else{
            showHideUnknownFundOps();
            document.getElementById('current_fund').appendChild(form);
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
    });
}

function openCloseCreateFund() {
    var x = document.getElementById("create_new_funds_params");
    if (x.style.display != "block") {
        setServerAvailability();
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function setServerAvailability() {
    var server_available = document.getElementById("server_availability");

    var apiUrl = '/api/campaign/check_server';
    fetch(apiUrl).then(response => {
        return response.json();
    }).then(data => {
        if (data['result'] == 'fail') {
            server_available.innerHTML = "Server is not available - New Crowd Funds will not be registered!";
        } else {
            server_available.innerHTML = "";
        }
    }).catch(err => {
        console.log("Server is not available");
        server_available.innerHTML = "Server is not available - New Crowd Funds will not be registered!";
    });
}

function showHideWallet() {
    var x = document.getElementById("wallet_operations");
    var button = document.getElementById("show_hide_wallet_operations_button");
    if (x.style.display != "block") {
        x.style.display = "block";
        button.innerHTML = 'Hide';
    } else {
        x.style.display = "none";
        button.innerHTML = 'Show';
    }
}
function showHideFundOperations() {
    var x = document.getElementById("fund_operations");
    var button = document.getElementById("show_hide_fund_operations_button");
    if (x.style.display != "block") {
        x.style.display = "block";
        button.innerHTML = 'Hide';
    } else {
        x.style.display = "none";
        button.innerHTML = 'Show';
    }
}

function showHideKnownAccounts() {
    var x = document.getElementById("known_accounts");
    var button = document.getElementById("show_hide_known_accounts_button");
    if (x.style.display != "block") {
        x.style.display = "block";
        button.innerHTML = 'Hide';
        listWallet();
    } else {
        x.style.display = "none";
        button.innerHTML = 'Show';
    }
}
function showHideKnownFunds() {
    closeFund();
    var x = document.getElementById("known_funds");
    var button = document.getElementById("show_hide_known_funds");
    if (x.style.display != "block") {
        x.style.display = "block";
        button.innerHTML = 'Hide Campaigns';
        listFunds();
    } else {
        x.style.display = "none";
        button.innerHTML = 'List Campaigns';
    }
}

function HideKnownFunds() {
    var x = document.getElementById("known_funds");
    var button = document.getElementById("show_hide_known_funds");
    x.style.display = "none";
    button.innerHTML = 'List Campaigns';
}
function closeFund() {
    document.getElementById("current_fund").innerHTML = "";
    document.getElementById("current_fund").style.display = 'none';
}

function showHideUnknownFundOps() {
    var x = document.getElementById("unknown_fund_ops");
    var button = document.getElementById("show_hide_unknown_fund_ops");
    if (x.style.display != "block") {
        x.style.display = "block";
        closeFund();
        button.innerHTML = 'Hide Unregistered Fund Operation';

        x.innerHTML = "";
        let h3 = document.createElement('h3');
        h3.innerHTML = "Unregistered Crowdfunds are funds that exists on the blockchain but are not listed in the public server. This can be caused by an unavailable public server. To perform operations on unregistered funds you need the fund address"
        x.appendChild(h3);

        let div = document.createElement('div');
        div.setAttribute('format_type', 'boxed');
        x.appendChild(div)

        
        
        let h2 = document.createElement('h2');
        h2.setAttribute('type', 'OpHeader');
        h2.innerHTML = "Get Fund Info From Blockchain";
        div.appendChild(h2)

        let label = document.createElement('label');
        label.setAttribute('type', 'type2');
        label.innerHTML = "Fund Address:"
        div.appendChild(label);

        let input = document.createElement('input');
        input.setAttribute('id', 'unreg_fund_fund_address');
        input.setAttribute('placeholder', '0x....');
        input.setAttribute('type', 'text');
        div.appendChild(input);

        let b = document.createElement('button');
        b.setAttribute('onClick', "getFundInfo('unreg')");
        b.setAttribute('format_type', "submit_create_fund");
        b.innerHTML = "Get Fund Info"
        div.appendChild(b);

        label = document.createElement('label');
        label.setAttribute('id', 'unred_fund_get_fund_result');
        label.setAttribute('type', 'type2');
        div.appendChild(label);

    } else {
        x.style.display = "none";
        button.innerHTML = 'Show Unregistered Fund Operation';
    }
}


function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

function submit_create_new_fund(){
    document.getElementById("create_fund_target_date").style.borderColor = '';
    document.getElementById("create_fund_creating_account").style.borderColor = '';
    document.getElementById("create_fund_description").style.borderColor = '';
    document.getElementById("create_fund_owner1").style.borderColor = "";
    document.getElementById("create_fund_owner2").style.borderColor = "";
    document.getElementById("create_fund_owner3").style.borderColor = "";
    document.getElementById('create_fund_result').value = "Creating new fund, this can take a minute or two...";
    var name = document.getElementById("create_fund_fundname");
    name.style.borderColor='';
    if (name.value.length < 5) {
        name.value= "";
        name.placeholder = "Name must be at least 5 characters long";
        name.style.borderColor = 'red';
        document.getElementById('create_fund_result').value = "Name must be at least 5 characters long";
        return;
    }
    name = name.value;
    var goal = document.getElementById("create_fund_goal");
    goal.style.borderColor='';
    var goal_currency = document.getElementById("create_fund_currency").value;
    if (!isNumeric(goal.value)){
        goal.value = "";
        goal.placeholder = "Must be an integer";
        goal.style.borderColor='red';
        document.getElementById('create_fund_result').value = "Goal must be an integer";
        return;
    }
    else {
        goal_value = BigInt(goal.value);
        if (goal_value < 1) {
            console.log(goal.value);
            goal.value = "";
            goal.placeholder = "Goal must be greater than 0";
            goal.style.borderColor='red';
            document.getElementById('create_fund_result').value = "Goal must be greater than 0";
            return;
        }
        if (goal_currency == 'ether'){
            goal_value = goal_value * BigInt(1000000000000000000);
        } else if (goal_currency == 'gwei'){
            goal_value = goal_value * BigInt(1000000000);
        } else if (goal_currency == 'finney'){
            goal_value = goal_value * BigInt(1000000000000000);
        }
    }
    
    var target_date = document.getElementById("create_fund_target_date").value;
    if (target_date == "") {
        document.getElementById("create_fund_target_date").style.borderColor = 'red';
        document.getElementById('create_fund_result').value = "Invalid Date";
        return;
    } else {
        console.log(typeof target_date);
        target_date = target_date.replaceAll("T", ", ").replaceAll("-", "/") + ":00";
    }
    var account = document.getElementById("create_fund_creating_account").value.trim();
    if (!is_address(account)) {
        document.getElementById("create_fund_creating_account").style.borderColor = 'red';
        document.getElementById('create_fund_result').value = "Illegal Account Address";
        return;
    }

    var owner1 = document.getElementById("create_fund_owner1").value.trim();
    if (!is_address(owner1)) {
        document.getElementById("create_fund_owner1").style.borderColor = 'red';
        document.getElementById('create_fund_result').value = "owner1 is invalid";
        return;
    }
    var owner2 = document.getElementById("create_fund_owner2").value.trim();
    if (!is_address(owner2)) {
        document.getElementById("create_fund_owner2").style.borderColor = 'red';
        document.getElementById('create_fund_result').value = "owner2 is invalid";
        return;
    }
    var owner3 = document.getElementById("create_fund_owner3").value.trim();
    if (!is_address(owner3)) {
        document.getElementById("create_fund_owner3").style.borderColor = 'red';
        document.getElementById('create_fund_result').value = "owner3 is invalid";
        return;
    }
    var description = document.getElementById("create_fund_description");
    if (description.value.length < 50) {
        description.value= "";
        description.placeholder = "Description must be at least 50 characters long";
        description.style.borderColor = 'red';
        document.getElementById('create_fund_result').value = "Description must be at least 50 characters long";
        return;
    }
    description = description.value;
    
    var apiUrl = new URL('/api/campaign/create', document.baseURI),
    params = {
        account: account,
        owner1: owner1,
        owner2: owner2,
        owner3: owner3,
        name: name,
        description: description,
        goal: goal_value.toString().replace("n", ""),
        expires: target_date
    }
    apiUrl.search = new URLSearchParams(params).toString();
    fetch(apiUrl, {
        method: 'POST'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('create_fund_result').value = "Account invalid or doesn't exist";
            } else {
                document.getElementById('create_fund_result').value = "Error: " + data["reason"];
            }
        } else if (data["result"] == "success") {
            console.log(data);
            document.getElementById('create_fund_result').value = "Created new fund with address: " + data['fund_address'];
            listFunds();
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('create_fund_result').value = "Account invalid or doesn't exist";
        }
    });

}

function is_address(s) {
    if (s.length == 40) return true;
    if (s.length == 42 && s[0] == '0' && (s[1] == 'x' || s[1] == 'X')) return true;
    return false;
}

function is_signature(s) {
    if (s.length == 130) return true;
    if (s.length == 132 && s[0] == '0' && (s[1] == 'x' || s[1] == 'X')) return true;
    return false;
}


function SendDonation(contract_address) {
    document.getElementById('donate_result').innerHTML = "Sending Donation...";
    amount = document.getElementById("fundAmount");
    account = document.getElementById("send_fund_account").value.trim();
    amount_currency = document.getElementById("fundCurrency").value;

    amount = BigInt(amount.value);
    if (amount_currency == 'ether'){
        amount = amount * BigInt(1000000000000000000);
    } else if (amount_currency == 'gwei'){
        amount = amount * BigInt(1000000000);
    } else if (amount_currency == 'finney'){
        amount = amount * BigInt(1000000000000000);
    }

    if (!is_address(account)) {
        document.getElementById('donate_result').innerHTML = "Invalid Account";
        return;
    }

    var apiUrl = new URL('/api/campaign/fund', document.baseURI),
    params = {
        account: account,
        amount: amount,
        fund_address: contract_address
    }
    
    apiUrl.search = new URLSearchParams(params).toString();
    fetch(apiUrl, {
        method: 'POST'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('donate_result').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('donate_result').innerHTML = "Error: " + data["reason"];
            }
        } else if (data["result"] == "success") {
            document.getElementById('donate_result').innerHTML = "Successfully donated";
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('donate_result').innerHTML = "Account invalid or doesn't exist";
        }
    });
}

function Refund(contract_address) {
    document.getElementById('refund_result').innerHTML = "Getting Refund...";
    account = document.getElementById("get_refund_account").value.trim();

    if (!is_address(account)) {
        document.getElementById('refund_result').innerHTML = "Invalid Account";
        return;
    }

    var apiUrl = new URL('/api/campaign/refund', document.baseURI),
    params = {
        account: account,
        fund_address: contract_address
    }
    apiUrl.search = new URLSearchParams(params).toString();
    fetch(apiUrl, {
        method: 'POST'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('refund_result').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('refund_result').innerHTML = "Error: " + data["reason"];
            }
        } else if (data["result"] == "success") {
            document.getElementById('refund_result').innerHTML = "Successfully refunded";
            // listFunds();
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('refund_result').innerHTML = "Account invalid or doesn't exist";
        }
    });
}

function WithdrawTwoAccounts(contract_address) {
    document.getElementById('withdraw_two_accounts_result').innerHTML = "Attempting withdrawal...";
    withdrawal_account = document.getElementById("withdraw_two_accounts_account_for_withdrawal").value.trim();
    authorizing_account1 = document.getElementById("two_account_authroized_account_1").value.trim();
    authorizing_account2 = document.getElementById("two_account_authroized_account_2").value.trim();

    if (!is_address(withdrawal_account)) {
        document.getElementById('withdraw_two_accounts_result').innerHTML = "Invalid Account";
        return;
    }
    if (!is_address(authorizing_account1)) {
        document.getElementById('withdraw_two_accounts_result').innerHTML = "Invalid Account For first authorizer";
        return;
    }
    if (!is_address(authorizing_account2)) {
        document.getElementById('withdraw_two_accounts_result').innerHTML = "Invalid Account For second authorizer";
        return;
    }

    var apiUrl = new URL('/api/campaign/signwithdrawal', document.baseURI),
    params = {
        dest_account: withdrawal_account,
        fund_address: contract_address,
        account: authorizing_account2
    }
    apiUrl.search = new URLSearchParams(params).toString();
    fetch(apiUrl, {
        method: 'POST'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('withdraw_two_accounts_result').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('withdraw_two_accounts_result').innerHTML = "Error: " + data["reason"];
            }
        } else if (data["result"] == "success") {
            signed_message = data["signed_message"];
            var apiUrl2 = new URL('/api/campaign/withdraw', document.baseURI),
            params = {
                dest_account: withdrawal_account,
                fund_address: contract_address,
                account: authorizing_account1,
                secondSignature: signed_message
            }
            apiUrl2.search = new URLSearchParams(params).toString();
            fetch(apiUrl2, {
                method: 'POST'
            }).then(response => {
                return response.json();
            }).then(data => {
                if (data["result"] == "fail"){
                    if (data["reason"] == "Invalid public key"){
                        document.getElementById('withdraw_two_accounts_result').innerHTML = "Account invalid or doesn't exist";
                    } else {
                        document.getElementById('withdraw_two_accounts_result').innerHTML = "Error: " + data["reason"];
                    }
                } else if (data["result"] == "success") {
                    document.getElementById('withdraw_two_accounts_result').innerHTML = "Successfully withdrew funds";
                    // listFunds();
                }
            }).catch(err => {
                console.log("err");
                console.log(err);
                if (err["reason"] == "Invalid public key"){
                    document.getElementById('withdraw_two_accounts_result').innerHTML = "Account invalid or doesn't exist";
                }
            });
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('withdraw_two_accounts_result').innerHTML = "Account invalid or doesn't exist";
        }
    });
}

function GenerateSigForWithdrawal(contract_address) {
    document.getElementById('generate_signature_result').innerHTML = "Attempting signing...";
    withdrawal_account = document.getElementById("generate_sig_account_for_withdrawal").value.trim();
    authorizing_account = document.getElementById("generate_sig_authroized_account").value.trim();

    if (!is_address(withdrawal_account)) {
        document.getElementById('generate_signature_result').innerHTML = "Invalid Account";
        return;
    }
    if (!is_address(authorizing_account)) {
        document.getElementById('generate_signature_result').innerHTML = "Invalid Account for Authorizer";
        return;
    }

    var apiUrl = new URL('/api/campaign/signwithdrawal', document.baseURI),
    params = {
        dest_account: withdrawal_account,
        fund_address: contract_address,
        account: authorizing_account
    }
    apiUrl.search = new URLSearchParams(params).toString();
    fetch(apiUrl, {
        method: 'POST'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('generate_signature_result').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('generate_signature_result').innerHTML = "Error: " + data["reason"];
            }
        } else if (data["result"] == "success") {
            document.getElementById('generate_signature_result').innerHTML = data["signed_message"];
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('generate_signature_result').innerHTML = "Account invalid or doesn't exist";
        }
    });
}


function WithdrawAccountAndSig(contract_address) {
    document.getElementById('withdraw_account_and_sig_result').innerHTML = "Attempting withdrawal...";
    withdrawal_account = document.getElementById("withdraw_account_and_sig_account_for_withdrawal").value.trim();
    authorizing_account = document.getElementById("account_and_sig_authroized_account_1").value.trim();
    signature_from_second_account = document.getElementById("account_and_sig_signature_withdrawal").value.trim();

    if (!is_address(withdrawal_account)) {
        document.getElementById('withdraw_account_and_sig_result').innerHTML = "Invalid Account";
        return;
    }
    if (!is_address(authorizing_account)) {
        document.getElementById('withdraw_account_and_sig_result').innerHTML = "Invalid Account for Authorizer";
        return;
    }
    if (!is_signature(signature_from_second_account)) {
        document.getElementById('withdraw_account_and_sig_result').innerHTML = "Invalid Signature";
        return;
    }
    
    var apiUrl = new URL('/api/campaign/withdraw', document.baseURI),
    params = {
        dest_account: withdrawal_account,
        fund_address: contract_address,
        account: authorizing_account,
        secondSignature: signature_from_second_account
    }
    apiUrl.search = new URLSearchParams(params).toString();
    fetch(apiUrl, {
        method: 'POST'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('withdraw_account_and_sig_result').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('withdraw_account_and_sig_result').innerHTML = "Error: " + data["reason"];
            }
        } else if (data["result"] == "success") {
            document.getElementById('withdraw_account_and_sig_result').innerHTML = "Successfully withdrew funds";
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('withdraw_account_and_sig_result').innerHTML = "Account invalid or doesn't exist";
        }
    });
}
