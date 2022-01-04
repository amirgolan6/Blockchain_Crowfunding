import requests
import os

MANAGER_HOST = os.environ.get("FUND_MANAGER_HOST")
MANAGER_API_PORT = os.environ.get("FUND_MANAGER_API_PORT")

def gen_url(api_url):
    return f"http://{MANAGER_HOST}:{MANAGER_API_PORT}{api_url}"

def get_list():
    url =  gen_url("/api/campaign/list")
    return requests.get(url).content.decode()

def get_info(pk):
    url = gen_url("/api/campaign/info")
    params = {
        "address": pk
    }
    return requests.get(url, params=params).content.decode()

def new_fund(address, owner1, owner2, owner3, name, description):
    url = gen_url("/api/campaign/create")
    params = {
        "address": address,
        "owner1": owner1,
        "owner2": owner2,
        "owner3": owner3,
        "name": name,
        "description": description
    }
    return requests.post(url, params=params).content.decode()

def end_fund(address, final_balance, dest_account):
    url = gen_url("/api/campaign/end")
    params = {
        "address": address,
        "final_balance": final_balance,
        "dest_account": dest_account,
    }
    return requests.post(url, params=params).content.decode()