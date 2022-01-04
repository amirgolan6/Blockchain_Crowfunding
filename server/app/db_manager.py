import time
import os
from typing import final
from sqlalchemy import create_engine, text
from datetime import timedelta, datetime

db_name = os.environ.get('DB_NAME')
db_user = os.environ.get('DB_USER')
db_pass = os.environ.get('DB_PASSWORD')
db_host = os.environ.get('DB_HOST')
db_port = os.environ.get('DB_PORT')

TABLE = 'fundraisers'

class DB:
    def __init__(self):
        db_connection_string = f'postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}'
        self.db = create_engine(db_connection_string)
        self.create_campaigns_table()

    def create_campaigns_table(self):
        for _ in range(3):
            try:
                with self.db.connect() as conn:
                    conn.execute(text(f"""CREATE TABLE IF NOT EXISTS {TABLE} (
                        address CHAR(40) CONSTRAINT firstkey PRIMARY KEY,
                        name VARCHAR(50) NOT NULL,
                        description VARCHAR(200),
                        expires timestamp,
                        goal NUMERIC(25, 0) NOT NULL,
                        owner1 CHAR(40) NOT NULL,
                        owner2 CHAR(40) NOT NULL,
                        owner3 CHAR(40) NOT NULL,
                        ended BOOLEAN NOT NULL,
                        dest_account CHAR(40),
                        final NUMERIC(25, 0)
                    )"""))
                    break
            except Exception:
                time.sleep(5)



    def add_campaign(self, name, description, expires, goal, address, owner1, owner2, owner3):
        print(f"Adding campaign {name}", flush=True)
        with self.db.connect() as conn:
            res = conn.execute(
            text(f"""INSERT INTO {TABLE} (name, description, expires, goal, address, owner1, owner2, owner3, ended) VALUES (:name, :description, :expires, :goal, :address, :owner1, :owner2, :owner3, :ended)"""),
             [{"name": name, "description": description, "expires": expires, "goal": goal, "address": address, "owner1": owner1, "owner2": owner2, "owner3": owner3, "ended": False}]
            )
        return f"Successfully added campaign {address}"


    def get_campaigns(self):
        print("Getting all campaigns", flush=True)
        with self.db.connect() as conn:
            res = conn.execute(
                text(f"SELECT name, expires, goal::text, address, ended from {TABLE}")
            )
            return [dict(zip(["name", "expires", "goal", "address", "ended"], [j.strftime("%d/%m/%Y, %H:%M:%S") if isinstance(j, datetime) else j for j in i])) for i in res]

    def get_campaign_info(self, address):
        print(f"Getting campaign {address}", flush=True)
        with self.db.connect() as conn:
            res = conn.execute(
                text(f"SELECT address, name, expires, goal::text, description, owner1, owner2, owner3, ended, dest_account, final::text from {TABLE} WHERE address = \'{address}\'")
            )
            res = res.all()
            if len(res) == 0:
                return {
                    "result": "Campaign not found"
                }
            elif len(res) != 1:
                return {
                    "result": "Unkown error"
                }
            return [dict(zip(["address", "name", "expires", "goal", "description", "owner1", "owner2", "owner3", "ended", "dest_account", "final"], [j.strftime("%d/%m/%Y, %H:%M:%S") if isinstance(j, datetime) else j for j in i])) for i in res][0]

    def end_campaign(self, address, dest_account, final_balance):
        print(f"Ending campaign {address}", flush=True)
        with self.db.connect() as conn:
            res = conn.execute(f"UPDATE {TABLE} SET ended=True, dest_account=(%s), final=(%s) WHERE address=(%s)",(dest_account, final_balance, address))        