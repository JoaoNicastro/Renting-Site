import os
import psycopg2
import sys
from dotenv import load_dotenv
import docker

client = docker.DockerClient()
container = client.containers.get('code_site_db_1')
ip_add = container.attrs['NetworkSettings']['Networks']['code_site_default']['IPAddress']
print(ip_add)
print(ip_add)

print(sys.path)

load_dotenv()  # Load environment variables from .env file

# Accessing environment variables
DB_NAME = os.getenv("POSTGRES_DB")
DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_HOST = ip_add  # Service name defined in Docker Compose
DB_PORT = "5432"  # Port exposed by PostgreSQL container

def get_db_connection():
    load_dotenv()  # Load environment variables from .env file

    # Accessing environment variables
    DB_NAME = os.getenv("POSTGRES_DB")
    DB_USER = os.getenv("POSTGRES_USER")
    DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
    # For Docker IP, this should ideally be set once outside this function or passed as a parameter
    client = docker.DockerClient()
    container = client.containers.get('code_site_db_1')
    DB_HOST = container.attrs['NetworkSettings']['Networks']['code_site_default']['IPAddress']
    DB_PORT = "5432"  # Port exposed by PostgreSQL container

    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    return conn

# Function to insert a compatibility score
def insert_compatibility_score(user_id_a, user_id_b, score):
    try:
        conn = get_db_connection()  # Establish database connection
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO compatibility_scores (user_id_a, user_id_b, score)
                VALUES (%s, %s, %s)
                """, (user_id_a, user_id_b, score))
            conn.commit()  # Commit the transaction
            print("Compatibility score inserted successfully")
    except psycopg2.Error as e:
        print(f"Failed to insert compatibility score: {e}")
    finally:
        if conn:
            conn.close()  # Ensure the connection is closed

def get_users():
    try:
        conn = get_db_connection()  # Establish database connection
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users")
            users = cur.fetchall()
            for user in users:
                print(user)  # Print each user or process as needed
            return users
    except psycopg2.Error as e:
        print(f"Failed to query database: {e}")
    finally:
        if conn:
            conn.close()  # Ensure the connection is closed

get_users()
#docker inspect code_site_db_1
"""
import json

# Path to the JSON file written by Node.js
file_path = '/workspaces/Renting-Site/Code_site/clientsData.json'

# Reading the JSON data from the file
try:
    with open(file_path, 'r') as file:
        clients_data = json.load(file)
        for client in clients_data:
            print(client)  # Process each client's data as needed
except FileNotFoundError:
    print(f"The file {file_path} does not exist.")
except json.JSONDecodeError:
    print(f"Error decoding JSON from the file {file_path}.")
"""
"""
import sys
import json

# Reading from stdin and parsing the JSON data
data = json.load(sys.stdin)

# Process the data
# For example, print the data to stdout or perform any kind of processing you need
print(data)
"""
