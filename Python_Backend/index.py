import mysql.connector
from mysql.connector import errorcode


cnx = mysql.connector.connect(user='root', password='Swatigupta@02',
                              host='127.0.0.1',
                              database='grocerystore')

cursor = cnx.cursor()

query = "SELECT * FROM grocerystore.Categories"

cursor.execute(query)

for (CategoryID, CategoryName,Description) in cursor:
    print(f"CategoryID: {CategoryID}, CategoryName: {CategoryName}, Description: {Description}")

cnx.close()