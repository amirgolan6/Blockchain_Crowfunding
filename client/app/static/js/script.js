function createAccount() {
    var password = document.getElementById("new_password").value;
    if (password == ""){
      document.getElementById('new_created_account').innerHTML = "Password must be not empty";
      return;
    }
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
        document.getElementById('create_account_btn').remove()
        document.getElementById('new_created_account').innerHTML = "New account created and saved: " + data["public_key"];
        console.log(data);
    }).catch(err => {
        console.log("err");
        console.log(err);
    });
}


function addExistingAccount() {
    var password = document.getElementById("add_account_password").value;
    var private_key = document.getElementById("add_account_private_key").value;
    if (password == "" || private_key == ""){
      document.getElementById('add_existing_account').innerHTML = "Private Key and Password must be not empty";
      return;
    }
    var apiUrl = new URL('/api/account/add', document.baseURI),
    params = {
        password: password,
        private_key: private_key
    }
    apiUrl.search = new URLSearchParams(params).toString();
    document.getElementById('add_existing_account').innerHTML = "Adding account...";
    fetch(apiUrl, {
        method: 'POST'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid private key"){
                document.getElementById('add_existing_account').innerHTML = "Invalid private key";
            } else {
                document.getElementById('add_existing_account').innerHTML = "Unknown error: " + data["reason"];
            }
        } else {
            console.log(data);
            document.getElementById('add_existing_acnt_btn').remove();
            document.getElementById('add_existing_account').innerHTML = "Account added and saved";
        }
        
    }).catch(err => {
        console.log("err");
        console.log(err);
    });
}

function deleteAccount() {
    var account = document.getElementById("delete_acoount").value;
    var apiUrl = new URL('/api/account/delete', document.baseURI),
    params = {
        public_key: account
    }
    if (account == ""){
      document.getElementById('deleted_account').innerHTML = "Account must be not empty";
      return;
    }
    apiUrl.search = new URLSearchParams(params).toString();
    document.getElementById('deleted_account').innerHTML = "Deleting account...";
    fetch(apiUrl, {
        method: 'DELETE'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('deleted_account').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('deleted_account').innerHTML = "Unknown error: " + data["reason"];
            }
        } else {
            document.getElementById('delete_acnt_btn').remove();
            document.getElementById('deleted_account').innerHTML = "Account deleted";
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('deleted_account').innerHTML = "Account invalid or doesn't exist";
        }
    });
}


function accountBalance() {
    var account = document.getElementById("account_public_key").value;
    var apiUrl = new URL('/api/account/get_balance', document.baseURI),
    params = {
        account: account
    }
    if (account == ""){
      document.getElementById('account_balance').innerHTML = "Account must be not empty";
      return;
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
            var num = BigInt(data['balance'])
            num = wei2eth(num);
            res = "Account balance is " + data['balance'] + " wei =~\n" + num + " eth"
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

function wei2eth(num) {
    return Number(num * 100000n / 1000000000000000000n) / 100000
}

function lockAccount() {
    var account = document.getElementById("lock_account_pk").value;
    var apiUrl = new URL('/api/account/lock', document.baseURI),
    params = {
        public_key: account
    }
    if (account == ""){
      document.getElementById('lock_account').innerHTML = "Account must be not empty";
      return;
    }
    apiUrl.search = new URLSearchParams(params).toString();
    document.getElementById('lock_account').innerHTML = "Locking account...";
    fetch(apiUrl, {
        method: 'POST'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('lock_account').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('lock_account').innerHTML = "Unknown error: " + data["reason"];
            }
        } else {
            document.getElementById('lock_account').innerHTML = "Account locked";
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('lock_account').innerHTML = "Account invalid or doesn't exist";
        }
    });
}

function unlockAccount() {
    var account = document.getElementById("unlock_account_pk").value;
    var password = document.getElementById("unlock_account_password").value;
    var apiUrl = new URL('/api/account/unlock', document.baseURI),
    params = {
        account: account,
        password: password
    }
    if (password == "" || account == ""){
      document.getElementById('unlock_account').innerHTML = "Public Key and Password must be not empty";
      return;
    }
    apiUrl.search = new URLSearchParams(params).toString();
    document.getElementById('unlock_account').innerHTML = "Unlocking account...";
    fetch(apiUrl, {
        method: 'POST'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('unlock_account').innerHTML = "Account invalid or doesn't exist";
            } else if (data["reason"] == "Wrong password") {
                document.getElementById('unlock_account').innerHTML = "Password is wrong";
            } else {
                document.getElementById('unlock_account').innerHTML = "Unknown error: " + data["reason"];
            }
        } else {
            document.getElementById('unlock_account').innerHTML = "Account unlocked";
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('unlock_account').innerHTML = "Account invalid or doesn't exist";
        }
    });
}

function getPrivateKey() {
    var account = document.getElementById("get_account_sk").value;
    var apiUrl = new URL('/api/account/private-key', document.baseURI),
    params = {
        account: account
    }
    if (account == ""){
      document.getElementById('account_sk').innerHTML = "Account must be not empty";
      return;
    }
    apiUrl.search = new URLSearchParams(params).toString();
    document.getElementById('account_sk').innerHTML = "Locking account...";
    fetch(apiUrl, {
        method: 'GET'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data["result"] == "fail"){
            if (data["reason"] == "Invalid public key"){
                document.getElementById('account_sk').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('account_sk').innerHTML = "Unknown error: " + data["reason"];
            }
        } else {
            document.getElementById('account_sk').innerHTML = "Private Key: " + data['result'];
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid account_sk key"){
            document.getElementById('account_sk').innerHTML = "Account invalid or doesn't exist";
        }
    });
}



function listAccounts(){
    document.getElementById('list_accounts').innerHTML = 'Getting Accounts...';
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
            text = document.createTextNode(wei2eth(BigInt(element['balance'])));
            cell.appendChild(text);

        }
        document.getElementById('get_list_btn').remove();
        document.getElementById('list_accounts').innerHTML = '';
        document.getElementById('list_accounts').appendChild(table);
    }).catch(err => {
        console.log("err");
        console.log(err);
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

  function create_new_campaign(){
    document.getElementById("project_name").style.borderColor = '';
    document.getElementById("project_desc").style.borderColor = '';
    document.getElementById("project_goal").style.borderColor = "";
    document.getElementById("creating_account").style.borderColor = "";
    document.getElementById("owner1").style.borderColor = "";
    document.getElementById("owner2").style.borderColor = "";
    document.getElementById("owner3").style.borderColor = "";
    document.getElementById("target_date").style.borderColor = "";

    var name = document.getElementById("project_name");
    name.style.borderColor='';
    if (name.value == "") {
        name.style.borderColor = 'red';
        document.getElementById('new_campaign_creation').innerHTML = "Name must be non empty";
        return;
    }
    name = name.value;

    var description = document.getElementById("project_desc");
    if (description.value == "") {
        description.style.borderColor = 'red';
        document.getElementById('new_campaign_creation').innerHTML = "Description must be non empty";
        return;
    }
    description = description.value;


    var goal = document.getElementById("project_goal");
    var goal_currency = document.getElementById("project_currency").value;
    if (goal.value <= 0){
        goal.style.borderColor='red';
        document.getElementById('new_campaign_creation').innerHTML = "Goal must be a positive integer";
        return;
    }
    
    goal_value = BigInt(goal.value);
    if (goal_currency == 'ether'){
        goal_value = goal_value * BigInt(1000000000000000000);
    } else if (goal_currency == 'gwei'){
        goal_value = goal_value * BigInt(1000000000);
    } else if (goal_currency == 'finney'){
        goal_value = goal_value * BigInt(1000000000000000);
    }
    

    var creating_account = document.getElementById("creating_account").value.trim();
    if (!is_address(creating_account)) {
        document.getElementById("creating_account").style.borderColor = 'red';
        document.getElementById('new_campaign_creation').innerHTML = "Illegal Creating Account Address";
        return;
    }


    var owner1 = document.getElementById("owner1").value.trim();
    if (!is_address(owner1)) {
        document.getElementById("owner1").style.borderColor = 'red';
        document.getElementById('new_campaign_creation').innerHTML = "Owner1: Illegal Account Address";
        return;
    }
    var owner2 = document.getElementById("owner2").value.trim();
    if (!is_address(owner2)) {
        document.getElementById("owner2").style.borderColor = 'red';
        document.getElementById('new_campaign_creation').innerHTML = "Owner2: Illegal Account Address";
        return;
    }
    var owner3 = document.getElementById("owner3").value.trim();
    if (!is_address(owner3)) {
        document.getElementById("owner3").style.borderColor = 'red';
        document.getElementById('new_campaign_creation').innerHTML = "Owner3: Illegal Account Address";
        return;
    }


    var target_date = document.getElementById("target_date").value;
    if (target_date == "") {
        document.getElementById("target_date").style.borderColor = 'red';
        document.getElementById('new_campaign_creation').innerHTML = "Invalid Target Date";
        return;
    } else {
        target_date = target_date.replaceAll("T", ", ").replaceAll("-", "/") + ":00";
    }

    document.getElementById('new_campaign_creation').innerHTML = "Creating new campaign, this can take a minute or two...";
    var apiUrl = new URL('/api/campaign/create', document.baseURI),
    params = {
        account: creating_account,
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
                document.getElementById('new_campaign_creation').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('new_campaign_creation').innerHTML = "Error: " + data["reason"];
            }
        } else if (data["result"] == "success") {
            console.log(data);
            document.getElementById('new_campaign_creation').innerHTML = "Created new fund with address: " + data['fund_address'];
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('new_campaign_creation').innerHTML = "Account invalid or doesn't exist";
        }
    });

}
 
function get_campaign_content_str(data){
      var contentList = [
      {'title':'Name', 'content':data['name']},
      {'title':'Address', 'content':data['address']}, 
      {'title':'Description', 'content':data['description']}, 
      {'title':'Expiration', 'content':data['expires']}, 
      {'title':'Expired', 'content':data.live_stats.expired},
      {'title':'Goal', 'content':BigInt(data.live_stats.goal) + " wei"}, 
      {'title':'Funds Received', 'content':BigInt(data.live_stats.balance) + " wei"},
      {'title':'Goal Reached', 'content':data.live_stats.goal_reached},
      {'title':'Owner1', 'content':data.owner1},
      {'title':'Owner2', 'content':data.owner2},
      {'title':'Owner3', 'content':data.owner3}
      ];
      var htmlStr = '<div><h1>Campaign Information</h1><br>'; // declare a variable which will hold the html for list
      for(var i=0;i<contentList.length;i++) // create a loop to loop through contentList
      {
         htmlStr += "<h3>"+contentList[i].title+": "+contentList[i].content+ "<h3/>" + "<br>";
      }
      htmlStr += "</div>"
      return htmlStr
}

function campaignInfo(address){
  document.getElementById('list_campaigns_body').innerHTML = 'Getting Information For Campaign' + address + '...';
  console.log(address)
  var unreg = false;

  if (!is_address(address)){
      document.getElementById('list_campaigns_body').innerHTML = "Invalid address. The address should be a contract address on the blockchain";
      return;
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
          document.getElementById('list_campaigns_body').innerHTML = "Invalid address. The address should be a contract address on the blockchain";
          return;
      }
      console.log(data)
      htmlStr = get_campaign_content_str(data)
      // add the newly created element and its content into the DOM
      document.getElementById('list_campaigns_body').innerHTML = htmlStr; // assign the innerhtml
       }).catch(err => {
        console.log("err");
        console.log(err);
     });   
}

function listCampaigns(){
    document.getElementById('list_campaigns').innerHTML = 'Getting Campaigns...';
    var apiUrl = '/api/campaign/list';
    fetch(apiUrl).then(response => {
        return response.json();
    }).then(data => {
        if (data.result == "fail") {
            document.getElementById('list_campaigns').innerHTML = 'Failed to retreive known funds from server';
        } else {
            console.log(data);
            html_str = "<table><tr><th>Name</th><th>Address</th><th>Target Date</th><th>Goal</th></tr>"
            for (let i in data){
              btn = "<th><button type=\"button2\" onclick="+"id=\"get_campaign_info_btn\">Get Info</button></th>"
              html_str += "<tr><th>"+data[i].name+"</th>"+"<th>"+data[i].address+"</th>"+"<th>"+data[i].expires+"</th>"+"<th>"+data[i].goal+"</th></tr>"
            }
            html_str+="</table>"    
            document.getElementById('get_campaigns_list_btn').remove();
            document.getElementById('list_campaigns').innerHTML = '';
            document.getElementById('list_campaigns_body').innerHTML = html_str;

        }
      }
    ).catch(err => {
        console.log("err");
        console.log(err);
    });
}


function donateCampaign() {
    amount = document.getElementById("donate_amount");
    account = document.getElementById("donate_account").value.trim();
    contract_address = document.getElementById("donate_address").value;
    amount_currency = document.getElementById("donate_currency").value;

    amount = BigInt(amount.value);
    if (amount_currency == 'ether'){
        amount = amount * BigInt(1000000000000000000);
    } else if (amount_currency == 'gwei'){
        amount = amount * BigInt(1000000000);
    } else if (amount_currency == 'finney'){
        amount = amount * BigInt(1000000000000000);
    }

    if(amount <= 0){
        document.getElementById('donate_campaign').innerHTML = "Amount must be greater than 0";
        return;
    }
    
    if (!is_address(account)) {
        document.getElementById('donate_campaign').innerHTML = "Invalid Account";
        return;
    }
    document.getElementById('donate_btn').remove();
    document.getElementById('donate_campaign').innerHTML = "Sending Donation...";

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
                document.getElementById('donate_campaign').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('donate_campaign').innerHTML = "Error: " + data["reason"];
            }
        } else if (data["result"] == "success") {
            document.getElementById('donate_campaign').innerHTML = "Successfully donated";
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('donate_campaign').innerHTML = "Account invalid or doesn't exist";
        }
    });
}



function getCampaignInfo() {
    address = document.getElementById("get_campaign_address").value.trim();
    var unreg = false;

    if (!is_address(address)){
        document.getElementById('get_campaign_res').innerHTML = "Invalid address. The address should be a contract address on the blockchain";
        return;
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
            document.getElementById('get_campaign_res').innerHTML = "Invalid address. The address should be a contract address on the blockchain";
            return;
        }
        console.log(data)
        document.getElementById('get_campaign_btn').remove();

        // var contentList = [
        // {'title':'Name', 'content':data['name']},
        // {'title':'Address', 'content':data['address']}, 
        // {'title':'Description', 'content':data['description']}, 
        // {'title':'Expiration', 'content':data['expires']}, 
        // {'title':'Expired', 'content':data.live_stats.expired},
        // {'title':'Goal', 'content':BigInt(data.live_stats.goal) + " wei"}, 
        // {'title':'Funds Received', 'content':BigInt(data.live_stats.balance) + " wei"},
        // {'title':'Goal Reached', 'content':data.live_stats.goal_reached},
        // {'title':'Owner1', 'content':data.owner1},
        // {'title':'Owner2', 'content':data.owner2},
        // {'title':'Owner3', 'content':data.owner3}
        // ];
        // var htmlStr = '<div><h1>Campaign Information</h1><br>'; // declare a variable which will hold the html for list
        // for(var i=0;i<contentList.length;i++) // create a loop to loop through contentList
        // {
        //    htmlStr += "<h3>"+contentList[i].title+": "+contentList[i].content+ "<h3/>" + "<br>";
        // }
        // htmlStr += "</div>"
        htmlStr = get_campaign_content_str(data)
        // add the newly created element and its content into the DOM

        document.getElementById('get_campaign_res').innerHTML = '';
        document.getElementById('get_campaign_form').innerHTML = '';
        document.getElementById('get_campaign_body').innerHTML = '';
        document.getElementById('get_campaign_body').innerHTML = htmlStr; // assign the innerhtml


    }).catch(err => {
        console.log("err");
        console.log(err);
     });
  }


  function getRefund() {
    document.getElementById('get_refund_res').innerHTML = "Getting Refund...";
    account = document.getElementById("get_refund_account_address").value.trim();
    contract_address = document.getElementById("get_refund_campaign_address").value.trim();

    if (!is_address(account)) {
        document.getElementById('get_refund_res').innerHTML = "Invalid Account";
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
                document.getElementById('get_refund_res').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('get_refund_res').innerHTML = "Error: " + data["reason"];
            }
        } else if (data["result"] == "success") {
            document.getElementById('get_refund_btn').remove();
            document.getElementById('get_refund_res').innerHTML = "Successfully refunded";
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('get_refund_res').innerHTML = "Account invalid or doesn't exist";
        }
    });
}



function produceSignature() {
    document.getElementById('produce_sig_res').innerHTML = "Attempting signing...";
    withdrawal_account = document.getElementById("produce_sig_dest_address").value.trim();
    authorizing_account = document.getElementById("produce_sig_author_address").value.trim();
    contract_address = document.getElementById("produce_sig_campaign_address").value.trim();
    if (!is_address(withdrawal_account)) {
        document.getElementById('produce_sig_res').innerHTML = "Invalid Account";
        return;
    }
    if (!is_address(authorizing_account)) {
        document.getElementById('produce_sig_res').innerHTML = "Invalid Account for Authorizer";
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
                document.getElementById('produce_sig_res').innerHTML = "Account invalid or doesn't exist";
            } else {
                document.getElementById('produce_sig_res').innerHTML = "Error: " + data["reason"];
            }
        } else if (data["result"] == "success") {
            document.getElementById('produce_sig_btn').remove();
            document.getElementById('produce_sig_res').innerHTML = data["signed_message"];
        }
    }).catch(err => {
        console.log("err");
        console.log(err);
        if (err["reason"] == "Invalid public key"){
            document.getElementById('produce_sig_res').innerHTML = "Account invalid or doesn't exist";
        }
    });
}