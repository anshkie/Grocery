# from fastapi import APIRouter, HTTPException, Request
# from pydantic import BaseModel
# from database import get_db_connection

# router = APIRouter()

# class AddToCartItem(BaseModel):
#     customer_id: int
#     product_id: int
#     quantity: int

# @router.post("/cart/add")
# def add_to_cart(item: AddToCartItem):
#     cnx = get_db_connection()
#     cursor = cnx.cursor(dictionary=True)

#     # Check for existing pending order
#     cursor.execute("SELECT OrderID FROM Orders WHERE CustomerID = %s AND Status = 'Pending'", (item.customer_id,))
#     order = cursor.fetchone()

#     if not order:
#         cursor.execute("INSERT INTO Orders (CustomerID) VALUES (%s)", (item.customer_id,))
#         cnx.commit()
#         order_id = cursor.lastrowid
#     else:
#         order_id = order["OrderID"]

#     # Get unit price
#     cursor.execute("SELECT UnitPrice FROM Products WHERE ProductID = %s", (item.product_id,))
#     product = cursor.fetchone()
#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")
    
#     unit_price = product["UnitPrice"]

#     # Check if item already in cart
#     cursor.execute("SELECT OrderDetailID FROM OrderDetails WHERE OrderID = %s AND ProductID = %s", (order_id, item.product_id))
#     existing = cursor.fetchone()

#     if existing:
#         cursor.execute("UPDATE OrderDetails SET Quantity = Quantity + %s WHERE OrderDetailID = %s", (item.quantity, existing["OrderDetailID"]))
#     else:
#         cursor.execute(
#             "INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice) VALUES (%s, %s, %s, %s)",
#             (order_id, item.product_id, item.quantity, unit_price)
#         )

#     cnx.commit()
#     cursor.close()
#     cnx.close()
#     return {"message": "Item added to cart", "order_id": order_id}
