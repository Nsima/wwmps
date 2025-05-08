import psycopg2

# Replace these values with your actual credentials
DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "password"

try:
    # Connect to PostgreSQL
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

    print("[✅] Connected to the database successfully!")

    # Create a cursor and execute a simple SELECT
    cur = conn.cursor()
    cur.execute("SELECT * FROM embeddings_metadata LIMIT 5;")
    rows = cur.fetchall()

    print("\n[📄] Sample Rows:")
    for row in rows:
        print(row)

    # Cleanup
    cur.close()
    conn.close()

except Exception as e:
    print(f"[❌] Database connection failed: {e}")
