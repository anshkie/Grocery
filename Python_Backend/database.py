# import mysql.connector
# from mysql.connector import errorcode
# import os
# from dotenv import load_dotenv

# load_dotenv()

# def get_db_connection():
#     try:
#         cnx = mysql.connector.connect(
#             user=os.getenv('DB_USER'),
#             password=os.getenv('DB_PASSWORD'),
#             host=os.getenv('DB_HOST'),
#             database=('GroceryStore')
#         )
#         return cnx
#     except mysql.connector.Error as err:
#         if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
#             print("Something is wrong with your user name or password")
#         elif err.errno == errorcode.ER_BAD_DB_ERROR:
#             print("Database does not exist",err)
#         else:
#             print(err)
#     return None


import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env if running locally

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            port=int(os.getenv("PORT", 4000)),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            ssl_ca=os.path.join(os.path.dirname(__file__), "isegrootx1.pem")  # Path to your CA cert
        )
        return connection
    except mysql.connector.Error as err:
        print("Database connection error:", err)
        return None
