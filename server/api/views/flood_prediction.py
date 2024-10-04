import requests
import rasterio
from rasterio.plot import show
import matplotlib.pyplot as plt
import os

# Access token (replace with your own token)
access_token = "eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6InJhaWhhbnJzZDk4IiwiZXhwIjoxNzMzMjQzNzE0LCJpYXQiOjE3MjgwNTk3MTQsImlzcyI6Imh0dHBzOi8vdXJzLmVhcnRoZGF0YS5uYXNhLmdvdiJ9.lnpvW6wxyP9NiHixrCbm1voTYYIWOa8fUkIs46QLTkXeAbLsr9xalKU2BWR-Ghqkz78vl-k0qxStWagODY2Gl2s0IwRC1JpnCDB8mhntqgnUFveRDK9uaneGZCxO8CMuwNkTXm4PsrZ6w27gJhXO66oaBE94M4MM149pTNudD_OQRcj5KUo4a5Z6xvIYBG12sLmfb2pat5O7jTp29qtvl5VJvtPmIuGKr-kKylzOn_oOzd5xFJRyci_zcHrktJJyJ_8Wssv0TS1F6L0Yc_fKA5FhZ3J5Q-gt8HAAP9Y4V4NZJOR3S1RR49nH47G5UAQhI2at_c5liJ6itMYu_oMcow"

# Define the API endpoint and parameters
api_url = "https://cmr.earthdata.nasa.gov/search/granules.json"

# Define the query parameters
params = {
    "short_name": "MOD09GQ",  # Short name of the MODIS dataset (you can change this)
    "temporal": "2024-09-01T00:00:00Z,2024-10-02T23:59:59Z",
    "bounding_box": "-180,-90,180,90",
    "page_size": 10  # Number of results per page
}

# Add authorization header
headers = {
    "Authorization": f"Bearer {access_token}"
}

# Make the API request
response = requests.get(api_url, headers=headers, params=params)

# Check if the request was successful
if response.status_code == 200:
    # Parse the JSON response
    data = response.json()

    # Check if there are any granules (data files) returned
    if 'feed' in data and 'entry' in data['feed']:
        granules = data['feed']['entry']
        print(f"Found {len(granules)} granules.")

        # Find the first granule with an available download link
        download_url = None
        for granule in granules:
            if 'links' in granule:
                for link in granule['links']:
                    if 'href' in link and link['href'].endswith('.tif'):  # Look for GeoTIFF files
                        download_url = link['href']
                        break
            if download_url:
                break

        if download_url:
            print(f"Downloading data from {download_url}...")

            # Download the GeoTIFF file
            tiff_file = 'modis_data.tif'
            response = requests.get(download_url)
            with open(tiff_file, 'wb') as f:
                f.write(response.content)

            print(f"Data downloaded and saved as {tiff_file}.")

            # Visualize the GeoTIFF data
            with rasterio.open(tiff_file) as dataset:
                # Plot the image using rasterio and matplotlib
                plt.figure(figsize=(10, 10))
                show(dataset, cmap='viridis')
                plt.title("MODIS Data Visualization")
                plt.show()
        else:
            print("No GeoTIFF files found in the granules.")
    else:
        print("No granules found for the given parameters.")
else:
    print(f"Failed to retrieve data. Status code: {response.status_code}")
    print(f"Response: {response.text}")
