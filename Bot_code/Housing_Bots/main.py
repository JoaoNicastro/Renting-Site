import General_Scraper
import csv


class Apartment:
    def __init__(self, id, url, title, location, price_per_month, area, number_of_rooms, interior, description, offered_since, availability, specification, upkeep_status, volume, type, construction_type, construction_year, location_type, number_of_bedrooms, number_of_bathrooms, number_of_floors, details_of_balcony, details_of_garden, details_of_storage, description_of_storage, garage, contact_details, image):
        self.id = id
        self.url = url
        self.title = title
        self.location = location
        self.price_per_month = price_per_month
        self.area = area
        self.number_of_rooms = number_of_rooms
        self.interior = interior
        self.description = description
        self.offered_since = offered_since
        self.availability = availability
        self.specification = specification
        self.upkeep_status = upkeep_status
        self.volume = volume
        self.type = type
        self.construction_type = construction_type
        self.construction_year = construction_year
        self.location_type = location_type
        self.number_of_bedrooms = number_of_bedrooms
        self.number_of_bathrooms = number_of_bathrooms
        self.number_of_floors = number_of_floors
        self.details_of_balcony = details_of_balcony
        self.details_of_garden = details_of_garden
        self.details_of_storage = details_of_storage
        self.description_of_storage = description_of_storage
        self.garage = garage
        self.contact_details = contact_details
        self.image = image

def load_apartments_from_csv(csv_filename):
    apartments = []
    with open(csv_filename, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for i, row in enumerate(reader):
            apartment = Apartment(
                id=i+1,
                url=row['URL'],
                title=row['TITLE'],
                location=row['LOCATION'],
                price_per_month=row['PRICE PER MONTH'],
                area=row['AREA IN m²'],
                number_of_rooms=row['NUMBER OF ROOMS'],
                interior=row['INTERIOR'],
                description=row['DESCRIPTION'],
                offered_since=row['OFFERED SINCE'],
                availability=row['AVAILABILITY'],
                specification=row['SPECIFICATION'],
                upkeep_status=row['UPKEEP STATUS'],
                volume=row['VOLUME'],
                type=row['TYPE'],
                construction_type=row['CONSTRUCTION TYPE'],
                construction_year=row['CONSTRUCTION YEAR'],
                location_type=row['LOCATION TYPE'],
                number_of_bedrooms=row['NUMBER OF BEDROOMS'],
                number_of_bathrooms=row['NUMBER OF BATHROOMS'],
                number_of_floors=row['NUMBER OF FLOORS'],
                details_of_balcony=row['DETAILS OF BALCONY'],
                details_of_garden=row['DETAILS OF GARDEN'],
                details_of_storage=row['DETAILS OF STORAGE'],
                description_of_storage=row['DESCRIPTION OF STORAGE'],
                garage=row['GARAGE'],
                contact_details=row['CONTACT DETAILS'],
                image=row['IMAGE']
            )
            apartments.append(apartment)
    return apartments

def get_apartment_by_id(apartments, apartment_id):
    for apartment in apartments:
        if apartment.id == apartment_id:
            return apartment
    return None

def main():
    General_Scraper.setup()
    load_apartments_from_csv('apartments.csv')
    
