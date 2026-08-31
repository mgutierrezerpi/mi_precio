import sqlite3, uuid, random
from datetime import datetime, timedelta

random.seed(7)
db = sqlite3.connect('/data/mi_precio.db')
TID = 'e9d5801b4f8646e8acd41780839b5ee1'
now = datetime.now()

# clean previous orders for a repeatable seed
db.execute("delete from order_items where order_id in (select id from orders where tenant_id=?)", (TID,))
db.execute("delete from orders where tenant_id=?", (TID,))

products = db.execute("select name, price from products where tenant_id=?", (TID,)).fetchall()
custs = {name: cid for cid, name in db.execute("select id, name from customers where tenant_id=?", (TID,))}

# customer -> (list of day-offsets for orders, max qty per line)
plan = {
    'Panadería La Espiga':   ([3, 10, 17, 24, 38, 52], 8),
    'Oficina Técnica SRL':   ([5, 14, 22, 45], 5),
    'Almacén Doña Rosa':     ([2, 12, 26], 6),
    'María Fernández':       ([6, 16, 28], 2),
    'Bar Esquina':           ([4, 19], 4),
    'Carlos Methol':         ([40], 2),
}

orders, items = [], []
for name, (offsets, maxq) in plan.items():
    cid = custs[name]
    for off in offsets:
        d = (now - timedelta(days=off)).replace(hour=random.randint(9, 19),
             minute=random.randint(0, 59), second=random.randint(0, 59),
             microsecond=random.randint(0, 999999))
        ts = d.strftime('%Y-%m-%d %H:%M:%S.%f')
        oid = uuid.uuid4().hex
        chosen = random.sample(products, random.randint(1, 4))
        total = 0.0
        for pname, price in chosen:
            qty = random.randint(1, maxq)
            total += price * qty
            items.append((uuid.uuid4().hex, ts, ts, oid, pname, qty, price))
        orders.append((oid, ts, ts, TID, cid, round(total, 2), 'UYU', 'paid', None, None))

db.executemany("insert into orders (id,created_at,updated_at,tenant_id,customer_id,total,currency,status,note,reference) values (?,?,?,?,?,?,?,?,?,?)", orders)
db.executemany("insert into order_items (id,created_at,updated_at,order_id,name,quantity,unit_price) values (?,?,?,?,?,?,?)", items)
db.commit()

rev = db.execute("select coalesce(sum(total),0) from orders where tenant_id=? and status='paid'", (TID,)).fetchone()[0]
print(f'orders={len(orders)} items={len(items)} revenue=UYU {rev:.0f}')
