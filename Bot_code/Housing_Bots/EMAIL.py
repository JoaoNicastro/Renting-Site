import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(user, matches):
    first_name = str(user[1])
    last_name = str(user[2])
    email = str(user[4])

    sender_email = "unistaystest@gmail.com"
    receiver_email = email
    password = 'oicw zoxn musb wsxl'  # Replace with your password

    number_apt = len(matches)

    message = MIMEMultipart("related")
    message["Subject"] = "You Have {number_apt} New Apartment Matches!"
    message["From"] = sender_email
    message["To"] = receiver_email

    # Your email body with inline CSS
    html = f"""\
    <!DOCTYPE html>
    <html lang="en">
    <body style="background-color: #f0f0f0;"> <!-- Change the body's background color -->
      <div style="padding: 20px;"> <!-- Wrapper with padding for the contrasting background -->
        <div class="container" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <!-- Loop through your matches and create the HTML for each match -->
    """

    # Loop to construct the HTML for each match
    for match in matches:
        # Add your match-related HTML content here with inline CSS
        html += f"""\
        <div class="image-header" style="position: relative; text-align: center; padding-top: 19.5px; padding-left: 13px; padding-right: 13px">
          <img src="{match['Image']}" alt="Flat Image" style="max-width: calc(100% - 26px); height: auto; border-radius: 20px; margin: 0 auto; display: block;">
          <div class="details" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px;">
            <p style="margin: 0; font-weight: bold; font-size: large; width: 80%; text-align: left; overflow: hidden; text-overflow: ellipsis;">{match['Address']}</p>
            <p style="margin: 0; font-weight: bold; font-size: xx-large; text-align: right"; margin-left: auto>€{match['Price']}</p>
          </div>
        </div>
        <div class="info" style="padding: 20px; text-align: left; display: flex; justify-content: space-between">
          <div>
            <p style="margin: 10px 0; font-size: large;"><strong>Surface area:</strong> {match['Area']}m²</p>
            <p style="margin: 10px 0; font-size: large;"><strong>Number of bedrooms:</strong> {match['Bedrooms']}</p>
            <p style="margin: 10px 0; font-size: large;"><strong>Furnished:</strong> {match['Furnished']}</p>
          </div>
          <img src="https://media.pararius.nl/image/PR0001680000/PR0001680371/image/jpeg/400x600/AmsterdamFagelstraat-210f_19.jpg" alt="Logo" style="max-width: 100px; height: auto; margin-left: 170px">
        </div>
        <div class="button-container" style="text-align: center; padding: 20px;">
          <a href="{match['Link']}" class="button" style="background-color: #191970; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; display: inline-block; font-weight: bold;">View listing</a>
        </div>
        """

    # Finish the HTML body
    html += f"""\
        <div class="footer" style="background-color: #191970; color: white; padding: 10px 20px; text-align: center; border-radius: 0 0 20px 20px;">
          © 2024 UniStays. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    """
    
    # Turn these into plain/html MIMEText objects
    part = MIMEText(html, "html")
    message.attach(part)

    # Create secure connection with server and send email
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message.as_string())