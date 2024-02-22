import psycopg2
import os

DB_NAME = os.getenv("POSTGRES_DB")
DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_HOST = 'db'  # Service name defined in Docker Compose
DB_PORT = "5432"  # Port exposed by PostgreSQL container


connection = psycopg2.connect(DB_NAME, DB_USER, DB_PASSWORD)

print(connection.closed)

#docker inspect 
