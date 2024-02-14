import csv

def match_apartments(client_preferences, base_path="/workspaces/Renting-Site/CSV"):
    print(client_preferences)
    username = client_preferences[0]
    first_name = client_preferences[1]
    last_name = client_preferences[2]
    phone_number = client_preferences[3]
    email = client_preferences[4]
    hashed_password = client_preferences[5]
    location = client_preferences[6]
    min_price = float(client_preferences[7])
    max_price = float(client_preferences[8])
    area = client_preferences[9]
    furnished = client_preferences[10]
    bedrooms = int(client_preferences[11].replace('+', ''))



    print(f"{username}, {min_price}, {max_price}, {furnished}, {bedrooms}")
    
    # Determine the CSV file path based on the location
    csv_file_path = f"{base_path}/{location}.csv"
    
    matching_apartments = []  # To store matching apartments
    
    try:
        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Convert apartment attributes to the correct type before comparison
                apt_bedrooms = int(row['bedrooms'])
                apt_area = float(row['area'])
                apt_price = float(row['price'])
                apt_furnished = bool(row['furnished'])
                
                # Check if the apartment matches the client's preferences
                if (min_price <= apt_price <= max_price and
                    apt_furnished == furnished and
                    apt_bedrooms >= bedrooms
                    ):
                    print("dubs")
                    matching_apartments.append(row)
    except FileNotFoundError:
        print(csv_file_path)
        print(f"No CSV file found for {location}.")
    
    return matching_apartments