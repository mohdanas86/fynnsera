# import json
# import random
# import uuid
# from datetime import datetime, timedelta

# def random_iso_date(start_year=2024, end_year=2026):
#     """Return a random ISO date string between two years."""
#     start = datetime(start_year, 1, 1)
#     end = datetime(end_year, 12, 31)
#     delta = end - start
#     random_days = random.randrange(delta.days)
#     random_seconds = random.randrange(86400)  # seconds in a day
#     random_date = start + timedelta(days=random_days, seconds=random_seconds)
#     return random_date.isoformat()

# def random_object_id():
#     """Generate a pseudo MongoDB ObjectId: 24-character hex string."""
#     return ''.join(random.choices('0123456789abcdef', k=24))

# # Lists for synthetic data
# categories = ["Travel", "Transportation", "Food", "Entertainment", "Bills", "Shopping"]
# descriptions = {
#     "Travel": ["United Airlines", "Air India flight", "Delta Airlines", "Emirates flight"],
#     "Transportation": ["Uber ride", "Lyft ride", "Taxi service", "Metro ride"],
#     "Food": ["Zomato order", "Swiggy delivery", "Domino's Pizza", "Cafe Latte"],
#     "Entertainment": ["BookMyShow movie", "Netflix subscription", "Spotify premium"],
#     "Bills": ["Electricity bill", "Phone recharge", "Internet subscription"],
#     "Shopping": ["Amazon purchase", "Flipkart order", "Etsy handmade"]
# }

# # For simplicity use a set userId for all or randomly choose from a list.
# user_ids = [
#     "67e67942a524dfc3177697e0",
#     "67e67942a524dfc3177697e1",
#     "67e67942a524dfc3177697e2"
# ]

# # Generate 98 records
# transactions = []
# for _ in range(1000):
#     cat = random.choice(categories)
#     # Random description from chosen category
#     desc = random.choice(descriptions.get(cat, ["Generic Transaction"]))
#     # Generate random amount: float with 2 decimals, or integer
#     amount = round(random.uniform(5, 1000), 2)
    
#     transaction = {
#         "accessToken": f"access-sandbox-{uuid.uuid4()}",
#         "accountId": ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', k=24)),
#         "amount": amount,
#         "category": cat,
#         "createdAt": random_iso_date(),
#         # use the date part (set time to midnight) based on createdAt
#         "date": datetime.fromisoformat(random_iso_date()).strftime("%Y-%m-%dT00:00:00.000Z"),
#         "description": desc,
#         "transactionId": str(uuid.uuid4()).replace("-", "")[:20],
#         "userId": random.choice(user_ids),
#         "__v": 0,
#         "_id": random_object_id()
#     }
#     transactions.append(transaction)

# # Save to JSON file
# with open("transactions.json", "w") as f:
#     json.dump(transactions, f, indent=2)

# print("Generated 'generated_transactions.json' with 98 transaction records.")


import json
import random
import uuid
from datetime import datetime, timedelta

# --- Expanded Categories --- #
categories = [
    "Groceries", "Bills", "Entertainment", "Shopping", "Utilities", "Income",
    "Travel", "Transportation", "Healthcare", "Education", "Dining",
    "Fitness", "Tech", "Personal Care", "Automotive", "Home Improvement", "Finance"
]

# --- Merchants for Each Category --- #
merchants = {
    "Groceries": ["Walmart", "Whole Foods", "Trader Joe's", "Kroger", "Safeway", "Costco", "Aldi", "Publix"],
    "Bills": ["AT&T", "Comcast", "Verizon", "T-Mobile", "Xfinity", "Spectrum", "DirectTV", "Geico"],
    "Entertainment": ["Netflix", "Spotify", "Hulu", "Steam", "AMC Theatres", "Disney+", "Apple Music", "Twitch"],
    "Shopping": ["Amazon", "eBay", "Zara", "H&M", "Best Buy", "Target", "Macy's", "Nike"],
    "Utilities": ["PG&E", "Water Company", "Electric Co", "Utility Board", "City Gas", "ConEd", "National Grid", "Duke Energy"],
    "Income": ["Salary Payment", "Freelance", "Upwork", "Bonus", "Commission", "Dividend", "Interest", "Rental Income"],
    "Travel": ["Delta Airlines", "United Airlines", "American Airlines", "Emirates", "Qatar Airways", "Lufthansa", "Air India", "British Airways", "Southwest Airlines", "JetBlue"],
    "Transportation": ["Uber", "Lyft", "Taxi Service", "Metro", "Bus Express", "Amtrak", "Bolt", "Grab"],
    "Healthcare": ["CVS Pharmacy", "Walgreens", "Kaiser Permanente", "Mayo Clinic", "HealthNet", "UnitedHealthcare", "Cigna", "Aetna"],
    "Education": ["Coursera", "Udemy", "edX", "Khan Academy", "Skillshare", "LinkedIn Learning", "Udacity"],
    "Dining": ["McDonald's", "Burger King", "Starbucks", "Subway", "Chipotle", "Domino's", "Pizza Hut", "Panera Bread", "Dunkin' Donuts"],
    "Fitness": ["Planet Fitness", "Gold's Gym", "24 Hour Fitness", "Anytime Fitness", "LA Fitness", "Equinox", "Fitness First"],
    "Tech": ["Apple Store", "Microsoft Store", "Best Buy", "Dell", "Amazon Tech", "Newegg", "B&H Photo Video", "Adorama"],
    "Personal Care": ["Sephora", "Ulta Beauty", "The Body Shop", "Lush", "Bath & Body Works", "Glossier", "Victoria's Secret"],
    "Automotive": ["Shell", "ExxonMobil", "BP", "Chevron", "Total", "AutoZone", "Pep Boys", "Costco Gas"],
    "Home Improvement": ["Home Depot", "Lowe's", "IKEA", "Menards", "Ace Hardware", "True Value"],
    "Finance": ["Chase Bank", "Bank of America", "Wells Fargo", "Citi", "Capital One", "HSBC", "TD Bank", "PNC Bank"]
}

# --- Items or Services per Category --- #
category_items = {
    "Groceries": ["groceries", "food", "household items", "snacks", "beverages", "produce", "dairy", "bakery", "frozen foods"],
    "Bills": ["internet", "phone", "cable", "insurance", "credit card", "mortgage", "rent", "electricity", "water", "gas bill"],
    "Entertainment": ["movie", "concert", "game", "subscription", "event", "streaming", "music", "festival", "show"],
    "Shopping": ["clothing", "electronics", "books", "home decor", "gifts", "shoes", "furniture", "accessories"],
    "Utilities": ["electricity", "water", "gas", "sewage", "trash", "heating", "cooling", "maintenance"],
    "Income": ["salary", "bonus", "freelance", "investment", "refund", "gift", "grant", "commission"],
    "Travel": ["flight", "hotel", "vacation", "trip", "journey", "cruise", "tour"],
    "Transportation": ["ride", "cab fare", "bus ticket", "train ticket", "metro pass"],
    "Healthcare": ["medical bill", "prescription", "checkup", "surgery", "consultation", "lab test"],
    "Education": ["tuition", "course fee", "workshop", "seminar", "textbooks", "subscription"],
    "Dining": ["lunch", "dinner", "brunch", "snack", "beverage", "coffee", "meal"],
    "Fitness": ["gym membership", "personal training", "fitness class", "yoga session", "bootcamp"],
    "Tech": ["laptop", "smartphone", "accessory", "software", "gadget", "tablet"],
    "Personal Care": ["makeup", "skincare", "haircut", "spa", "massage", "perfume"],
    "Automotive": ["fuel", "oil change", "car repair", "service", "tire replacement"],
    "Home Improvement": ["furniture", "tool", "DIY supplies", "garden", "appliance", "painting"],
    "Finance": ["bank fee", "investment", "loan", "credit card fee", "finance charge"]
}

# --- Amount Ranges per Category (min, max) --- #
amount_ranges = {
    "Groceries": (10, 200),
    "Bills": (40, 600),
    "Entertainment": (5, 150),
    "Shopping": (20, 1500),
    "Utilities": (30, 400),
    "Income": (1000, 5000),
    "Travel": (100, 3000),
    "Transportation": (2, 100),
    "Healthcare": (20, 1000),
    "Education": (50, 1000),
    "Dining": (5, 100),
    "Fitness": (10, 150),
    "Tech": (200, 3000),
    "Personal Care": (10, 200),
    "Automotive": (10, 500),
    "Home Improvement": (50, 2000),
    "Finance": (1, 30)
}

# --- Description Templates --- #
templates_with_merchant = [
    "{merchant} purchase",
    "Payment to {merchant}",
    "{merchant} - {item}",
    "Subscription to {merchant}",
    "Bill from {merchant}",
    "Shopping at {merchant}"
]

templates_without_merchant = [
    "{category} expense",
    "{category} payment",
    "{category} - {item}",
    "General {category}"
]

def generate_description(category, merchant, item):
    if merchant:
        template = random.choice(templates_with_merchant)
        if "{item}" in template:
            return template.format(merchant=merchant, item=item)
        return template.format(merchant=merchant)
    else:
        template = random.choice(templates_without_merchant)
        if "{item}" in template:
            return template.format(category=category, item=item)
        return template.format(category=category)

def generate_transaction(category):
    use_merchant = random.random() < 0.8  # 80% chance to include a merchant
    merchant = random.choice(merchants[category]) if use_merchant else None
    item = random.choice(category_items[category])
    description = generate_description(category, merchant, item)
    amount = round(random.uniform(*amount_ranges[category]), 2)
    return {
        "amount": amount,
        "description": description,
        "category": category
    }

# --- Generate 5000 Transactions --- #
transactions = [generate_transaction(random.choice(categories)) for _ in range(5000)]

# --- Save Transactions to JSON --- #
with open("transactions.json", "w") as f:
    json.dump(transactions, f, indent=2)

print("Generated 5000 transactions and saved to transactions.json")
