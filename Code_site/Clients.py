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

def get_users():
    try:
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
        
        # Perform database operations
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM users")
                users = cur.fetchall()
                print(users)
                return users
        except psycopg2.Error as query_error:
            print(f"Failed to query database: {query_error}")
        
        finally:
            # Close the database connection
            conn.close()

    except psycopg2.Error as connection_error:
        print(f"Database connection failed: {connection_error}")

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
