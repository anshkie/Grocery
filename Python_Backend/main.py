# main.py
from fastapi import  Request
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import Categories  # Your router module
from fastapi import APIRouter, HTTPException
from database import get_db_connection
from fastapi.responses import JSONResponse
import stripe
import os
app = FastAPI(title="Grocery Store API", description="API for Grocery Store", version="1.0.0")
port = int(os.environ.get("PORT", 4000))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=port)
# CORS setup
origins = [
    "http://localhost",
    "http://localhost:5173",  # Vite
    "http://localhost:3000",  # CRA
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register route
# app.include_router(Categories.router, prefix="/api")

@app.get("/")
def home():
    return {"message": "Welcome to the Grocery Store API"}

@app.get("/categories")
async def get_categories():
    cnx = get_db_connection()
    if cnx is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = cnx.cursor(dictionary=True)
    query = "SELECT * FROM grocerystore.Categories"  # ✅ Cleaned query
    cursor.execute(query)
    categories = cursor.fetchall()
    
    if not categories:
        raise HTTPException(status_code=404, detail="No categories found")
    cursor.close()
    cnx.close()
    return {"categories": categories}

@app.get("/categories/{category_id}/products")   
async def get_category(category_id: int):
    cnx = get_db_connection()
    if cnx is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = cnx.cursor(dictionary=True)
    query = "SELECT * FROM grocerystore.Products WHERE CategoryID = %s AND Discontinued = FALSE"
    cursor.execute(query, (category_id,))
    products = cursor.fetchall()  # Use fetchall() to get multiple products

    if not products:
        raise HTTPException(status_code=404, detail="No products found for this category")

    cursor.close()
    cnx.close()
    return {"products": products}

class AddToCartItem(BaseModel):
    customer_id: int
    product_id: int
    quantity: int

@app.post("/cart/add")
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


@app.get("/cart/{customer_id}")
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

@app.post("/create-intent")
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

@app.post("/customers/add")
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

@app.get("/orders")
async def get_orders():
    conn = get_db_connection()
    if not conn:
        return JSONResponse(content={"error": "Database connection failed"}, status_code=500)
    
    cursor = conn.cursor(dictionary=True)

    # Fetch all orders and their details
    query = """
        SELECT 
            o.OrderId, 
            o.OrderDate, 
            o.Status, 
            o.TotalAmount,
            od.ProductId, 
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
    Orders = {}
    for row in rows:
        OrderId = row["OrderId"]
        if OrderId not in Orders:
            Orders[OrderId] = {
                "OrderId": OrderId,
                "OrderDate": row["OrderDate"].isoformat(),
                "Status": row["Status"],
                "TotalAmount": float(row["TotalAmount"]),
                "details": []
            }
        Orders[OrderId]["details"].append({
            "ProductId": row["ProductId"],
            "Quantity": row["Quantity"],
            "UnitPrice": float(row["UnitPrice"]),
            "SubTotal": float(row["SubTotal"])
        })
    
    return JSONResponse(content=list(Orders.values()), status_code=200)


@app.put("/orders/{order_id}/complete")
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

@app.get("/customer/profile/{id}")
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

@app.put("/customer/profile/{id}")
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

