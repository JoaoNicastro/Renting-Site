from dotenv import load_dotenv
import os
import psycopg2
import sys
import time

print(sys.path)

load_dotenv()  # Load environment variables from .env file

#Accessing environment variables
DB_NAME = os.getenv("POSTGRES_DB")
DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_HOST = 'db'  # Service name defined in Docker Compose
DB_PORT = "5432"  # Port exposed by PostgreSQL container


def get_users():
    try:
        time.sleep(10)
        # Attempt to establish a database connection
        print(DB_HOST)
        print(DB_NAME)
        print(DB_PASSWORD) 
        print(DB_PORT)
        print(DB_USER)
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        print("Database connection successful")

#Perform database operations 
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM users")
                users = cur.fetchall()
                return users
        except psycopg2.Error as query_error:
            print(f"Failed to query database: {query_error}")

        finally:
            # Close the database connection
            conn.close()

    except psycopg2.Error as connection_error:
        print(f"Database connection failed: {connection_error}")
