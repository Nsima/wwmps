import psycopg2
from config import POSTGRES

def insert_metadata(chunk_id, title, source_url, transcription_date, word_count, char_count):
    conn = psycopg2.connect(**POSTGRES)
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO embeddings_metadata (chunk_id, title, source_url, transcription_date, word_count, char_count)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (chunk_id) DO NOTHING;
    """, (chunk_id, title, source_url, transcription_date, word_count, char_count))

    conn.commit()
    cur.close()
    conn.close()
