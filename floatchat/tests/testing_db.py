import psycopg2

PROD_DB = "postgresql://postgres:Jagadeeswar%4015@db.qzazjhsvbhodoaplhrwm.supabase.co:5432/postgres"
DOCKER_DB = "postgresql://postgres:pass@localhost:5432/floatchat"
conn = psycopg2.connect(DOCKER_DB)
cur = conn.cursor()
cur.execute("SELECT * FROM measurements")
print(cur.fetchone())
cur.close()
conn.close()
