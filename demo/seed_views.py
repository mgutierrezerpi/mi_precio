import sqlite3, uuid, random
from datetime import datetime, timedelta

random.seed(42)
db = sqlite3.connect('/data/mi_precio.db')
TID = 'e9d5801b4f8646e8acd41780839b5ee1'
LID = '4809cc758d1e4cc48e2d10315f11904f'
now = datetime.now()

# Clear previous seeded/real views so the chart is a clean, believable curve.
db.execute('delete from page_views where tenant_id=?', (TID,))

rows = []
for d in range(29, -1, -1):                 # 29 days ago -> today
    day = now - timedelta(days=d)
    # gentle upward trend + weekday variation + noise
    trend = 3 + (29 - d) * 0.32             # grows toward today
    weekend = 3 if day.weekday() >= 5 else 0
    count = max(1, int(random.gauss(trend + weekend, 2.2)))
    for _ in range(count):
        ts = day.replace(hour=random.randint(8, 21), minute=random.randint(0, 59),
                         second=random.randint(0, 59), microsecond=random.randint(0, 999999))
        source = 'qr' if random.random() < 0.28 else 'link'
        rows.append((uuid.uuid4().hex, ts.strftime('%Y-%m-%d %H:%M:%S.%f'),
                     ts.strftime('%Y-%m-%d %H:%M:%S.%f'), TID, LID, source))

db.executemany(
    'insert into page_views (id, created_at, updated_at, tenant_id, list_id, source) values (?,?,?,?,?,?)',
    rows)
db.commit()

total = db.execute('select count(*) from page_views where tenant_id=?', (TID,)).fetchone()[0]
qr = db.execute("select count(*) from page_views where tenant_id=? and source='qr'", (TID,)).fetchone()[0]
days = db.execute('select count(distinct date(created_at)) from page_views where tenant_id=?', (TID,)).fetchone()[0]
print(f'inserted {len(rows)} views | total={total} | qr={qr} link={total-qr} | days_with_data={days}')
