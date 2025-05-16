# routes/Categories.py
from fastapi.responses import JSONResponse

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from database import get_db_connection
import stripe
import os
router = APIRouter()

class AddToCartItem(BaseModel):
    customer_id: int
    product_id: int
    quantity: int

@router.post("/cart/add")
def add_to_cart(item: AddToCartItem):
    cnx = get_db_connection()
    cursor = cnx.cursor(dictionary=True)

    # Ensure customer exists
    cursor.execute("SELECT 1 FROM Customers WHERE CustomerID = %s", (item.customer_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=400, detail="Customer does not exist")

    # Check for existing pending order
    cursor.execute("SELECT OrderID FROM Orders WHERE CustomerID = %s AND Status = 'Pending'", (item.customer_id,))
    order = cursor.fetchone()

    if not order:
        cursor.execute("INSERT INTO Orders (CustomerID) VALUES (%s)", (item.customer_id,))
        cnx.commit()
        order_id = cursor.lastrowid
    else:
        order_id = order["OrderID"]

    # Get unit price
    cursor.execute("SELECT UnitPrice FROM Products WHERE ProductID = %s", (item.product_id,))
    product = cursor.fetchone()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    unit_price = product["UnitPrice"]

    # Check if item already in cart
    cursor.execute("SELECT OrderDetailID FROM OrderDetails WHERE OrderID = %s AND ProductID = %s", (order_id, item.product_id))
    existing = cursor.fetchone()

    if existing:
        cursor.execute("UPDATE OrderDetails SET Quantity = Quantity + %s WHERE OrderDetailID = %s", (item.quantity, existing["OrderDetailID"]))
    else:
        cursor.execute(
            "INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice) VALUES (%s, %s, %s, %s)",
            (order_id, item.product_id, item.quantity, unit_price)
        )

    cnx.commit()
    cursor.close()
    cnx.close()
    return {"message": "Item added to cart", "order_id": order_id}


@router.get("/cart/{customer_id}")
def get_cart(customer_id: int):
    cnx = get_db_connection()
    cursor = cnx.cursor(dictionary=True)

    # Get the current pending order for the customer
    cursor.execute("SELECT OrderID FROM Orders WHERE CustomerID = %s AND Status = 'Pending'", (customer_id,))
    order = cursor.fetchone()

    if not order:
        return {"order_id": None, "cart": []}

    order_id = order["OrderID"]

    # Fetch cart items
    cursor.execute("""
        SELECT od.OrderDetailID, od.ProductID, p.ProductName, od.Quantity, od.UnitPrice,
               (od.Quantity * od.UnitPrice) AS TotalPrice
        FROM OrderDetails od
        JOIN Products p ON od.ProductID = p.ProductID
        WHERE od.OrderID = %s
    """, (order_id,))
    cart_items = cursor.fetchall()

    cursor.close()
    cnx.close()
    return {
        "order_id": order_id,
        "cart": cart_items
    }


stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Optional request model
class PaymentIntentRequest(BaseModel):
    amount: int = 1099
    currency: str = "usd"

@router.post("/create-intent")
async def create_payment_intent(data: PaymentIntentRequest = PaymentIntentRequest()):
    try:
        intent = stripe.PaymentIntent.create(
            amount=data.amount,
            currency=data.currency,
            automatic_payment_methods={"enabled": True},
        )
        return {"client_secret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class Customer(BaseModel):
    CustomerName: str
    ContactEmail: str
    ContactPhone: str
    Address: str
@router.post("/customers/add")
async def add_customer(customer: Customer):
    cnx = get_db_connection()
    if cnx is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = cnx.cursor()

    # Insert without specifying CustomerID
    query = """
        INSERT INTO Customers (CustomerName, ContactEmail, ContactPhone, Address)
        VALUES (%s, %s, %s, %s)
    """
    cursor.execute(query, (
        customer.CustomerName,
        customer.ContactEmail,
        customer.ContactPhone,
        customer.Address
    ))
    cnx.commit()

    new_id = cursor.lastrowid  # Get auto-generated ID
    cursor.close()
    cnx.close()

    return {"message": "Customer added successfully", "CustomerID": new_id}


@router.get("/orders")
async def get_orders():
    conn = get_db_connection()
    if not conn:
        return JSONResponse(content={"error": "Database connection failed"}, status_code=500)
    
    cursor = conn.cursor(dictionary=True)

    # Fetch all orders and their details
    query = """
        SELECT 
            o.orderId, 
            o.orderDate, 
            o.Status, 
            o.TotalAmount,
            od.productId, 
            od.Quantity, 
            od.UnitPrice, 
            od.SubTotal
        FROM 
            orders o
        JOIN 
            orderDetails od ON o.OrderId = od.OrderId
        ORDER BY o.orderDate DESC
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    # Group order details by order ID
    orders = {}
    for row in rows:
        orderId = row["orderId"]
        if orderId not in orders:
            orders[orderId] = {
                "orderId": orderId,
                "orderDate": row["orderDate"].isoformat(),
                "status": row["status"],
                "totalAmount": float(row["total_amount"]),
                "details": []
            }
        orders[orderId]["details"].append({
            "productId": row["productId"],
            "quantity": row["quantity"],
            "unitPrice": float(row["unitPrice"]),
            "subTotal": float(row["subTotal"])
        })
    
    return JSONResponse(content=list(orders.values()), status_code=200)

@router.put("/orders/{order_id}/complete")
def mark_order_complete(order_id: int):
    cnx = get_db_connection()
    if cnx is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Orders WHERE OrderId = %s", (order_id,))
    order = cursor.fetchone()
    if not order:
        cursor.close()
        cnx.close()
        raise HTTPException(status_code=404, detail="Order not found")
    cursor.execute("UPDATE Orders SET Status = %s WHERE OrderId = %s", ("Completed", order_id))
    cnx.commit()
    cursor.close()
    cnx.close()
    return {"message": "Order marked as completed"}

@router.get("customer/profile/${id}")
async def get_customer_profile(id: int):
    cnx = get_db_connection()
    if cnx is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = cnx.cursor(dictionary=True)
    query = "SELECT * FROM Customers WHERE CustomerID = %s"
    cursor.execute(query, (id,))
    customer = cursor.fetchone()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    cursor.close()
    cnx.close()
    return {"customer": customer}

@router.put("/customer/profile/${id}")
async def update_customer_profile(id: int, customer: Customer):
    cnx = get_db_connection()
    if cnx is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = cnx.cursor(dictionary=True)
    query = """
        UPDATE Customers 
        SET CustomerName = %s, ContactEmail = %s, ContactPhone = %s, Address = %s
        WHERE CustomerID = %s
    """
    cursor.execute(query, (
        customer.CustomerName,
        customer.ContactEmail,
        customer.ContactPhone,
        customer.Address,
        id
    ))
    cnx.commit()

    cursor.close()
    cnx.close()
    return {"message": "Customer profile updated successfully"}

