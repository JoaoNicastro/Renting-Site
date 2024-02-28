import csv
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import json

#pip install geopy

def match_apartments(client_preferences, base_path="/workspaces/Renting-Site/CSV"):
    print(client_preferences)
    username = client_preferences[0]
    first_name = client_preferences[1]
    last_name = client_preferences[2]
    phone_number = client_preferences[3]
    email = client_preferences[4]
    hashed_password = client_preferences[5]
    city = client_preferences[6]
    min_price = float(client_preferences[7])
    max_price = float(client_preferences[8])
    min_area = client_preferences[9]
    max_area = client_preferences[10]
    furnished = client_preferences[11]
    bedrooms = int(client_preferences[12].replace('+', ''))
    university = client_preferences[13]
    location_pref = client_preferences[14]
    if (location_pref == "Distance"):
        radius = client_preferences[15]
    if (location_pref == "Neighborhood"):
        list = client_preferences[15]
        neighborhoods = list.split(',')

    geolocator = Nominatim(user_agent="geoapiExercises")

    if (university == ""):
        client_location = geolocator.geocode(city)
        client_location = (client_location.latitude, client_location.longitude)
        print(f"Location details: {client_location.address}")
    else:
        client_location = geolocator.geocode(city)
        client_location = (client_location.latitude, client_location.longitude)
        print(f"Location details: {client_location.address}")

    
    # Determine the CSV file path based on the location
    csv_file_path = f"{base_path}/{city}.csv"
    
    matching_apartments = []  # To store matching apartments
    
    try:
        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Convert apartment attributes to the correct type before comparison
                apt_address = str(row['Address'])

                apt_address = geolocator.geocode(apt_address)
                apt_address = (apt_address.latitude, apt_address.longitude)

                apt_bedrooms = int(row['Bedrooms'])
                apt_area = float(row['Area'])
                apt_price = float(row['Price'])
                apt_furnished = bool(row['Furnished'])

                if (location_pref == "Distance"):
                    distance = geodesic(client_location, apt_address).kilometers
                    if (distance <= radius and min_price <= apt_price <= max_price and
                    apt_furnished == furnished and
                    apt_bedrooms >= bedrooms):
                        print("dubs")
                        matching_apartments.append(row)
                elif (location_pref == "Neighborhood"):
                    print(f"Location details: {apt_address.address}")
                    #get neighborhood
                    neighborhood = ""
                    if (neighborhood in neighborhoods and min_price <= apt_price <= max_price and
                    apt_furnished == furnished and
                    apt_bedrooms >= bedrooms):
                        print("dubs")
                        matching_apartments.append(row)
                else:
                    if (min_price <= apt_price <= max_price and
                    apt_furnished == furnished and
                    apt_bedrooms >= bedrooms
                    ):
                        print("dubs")
                        matching_apartments.append(row)
    except FileNotFoundError:
        print(csv_file_path)
        print(f"No CSV file found for {city}.")
    
    return matching_apartments