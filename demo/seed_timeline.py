import sqlite3, uuid, random
from datetime import datetime, timedelta

random.seed(11)
db = sqlite3.connect('/data/mi_precio.db')
TID = 'e9d5801b4f8646e8acd41780839b5ee1'
now = datetime.now()

def ts(days_ago, h=None):
    d = (now - timedelta(days=days_ago)).replace(
        hour=h if h is not None else random.randint(9, 19),
        minute=random.randint(0, 59), second=random.randint(0, 59),
        microsecond=random.randint(0, 999999))
    return d.strftime('%Y-%m-%d %H:%M:%S.%f')

products = db.execute("select name, price from products where tenant_id=?", (TID,)).fetchall()
custs = {name: cid for cid, name in db.execute("select id, name from customers where tenant_id=?", (TID,))}

# name -> (joined days-ago, list of order offsets within tenure, max qty/line)
timeline = {
    'Carlos Methol':       (45, [42], 2),
    'Panadería La Espiga': (27, [2, 7, 13, 19, 24, 26], 8),
    'Oficina Técnica SRL': (22, [3, 9, 16, 21], 5),
    'Almacén Doña Rosa':   (12, [1, 5, 11], 6),
    'María Fernández':     (8,  [2, 4, 7], 2),
    'Bar Esquina':         (4,  [1, 3], 4),
}

# 1) customers.created_at = joined date; 2) their "Agregó el cliente" activity = same
for name, (joined, _, _) in timeline.items():
    t = ts(joined)
    db.execute("update customers set created_at=? where id=?", (t, custs[name]))
    db.execute("update activities set created_at=?, updated_at=? where tenant_id=? and summary like ?",
               (t, t, TID, f'Agregó el cliente «{name}%'))

# 3) setup activities (products / list) -> business start ~46-48 days ago
setup = db.execute("select id from activities where tenant_id=? and summary not like 'Agregó el cliente%' order by created_at",
                   (TID,)).fetchall()
base = 48
for idx, (aid,) in enumerate(setup):
    d = (now - timedelta(days=base) + timedelta(minutes=idx * 25)).strftime('%Y-%m-%d %H:%M:%S.%f')
    db.execute("update activities set created_at=?, updated_at=? where id=?", (d, d, aid))

# 4) re-seed orders within each customer's tenure
db.execute("delete from order_items where order_id in (select id from orders where tenant_id=?)", (TID,))
db.execute("delete from orders where tenant_id=?", (TID,))
orders, items = [], []
for name, (joined, offsets, maxq) in timeline.items():
    cid = custs[name]
    for off in offsets:
        t = ts(off)
        oid = uuid.uuid4().hex
        total = 0.0
        for pname, price in random.sample(products, random.randint(1, 4)):
            qty = random.randint(1, maxq)
            total += price * qty
            items.append((uuid.uuid4().hex, t, t, oid, pname, qty, price))
        orders.append((oid, t, t, TID, cid, round(total, 2), 'UYU', 'paid', None, None))
db.executemany("insert into orders (id,created_at,updated_at,tenant_id,customer_id,total,currency,status,note,reference) values (?,?,?,?,?,?,?,?,?,?)", orders)
db.executemany("insert into order_items (id,created_at,updated_at,order_id,name,quantity,unit_price) values (?,?,?,?,?,?,?)", items)
db.commit()

print("customers updated:", len(timeline), "| setup activities spread:", len(setup),
      "| orders:", len(orders), "| revenue UYU",
      int(db.execute("select coalesce(sum(total),0) from orders where tenant_id=? and status='paid'", (TID,)).fetchone()[0]))
print("recent activity:")
for s, c in db.execute("select summary, created_at from activities where tenant_id=? order by created_at desc limit 6", (TID,)):
    print("  ", c[:16], s)
