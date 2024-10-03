from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

import numpy as np
import pandas as pd
# import matplotlib.pyplot as plt
from scipy.stats import gamma,norm
from pathlib import Path

from typing import List, Union, Optional
from datetime import date, datetime
import requests
import os

from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_squared_error
import joblib
from sklearn.model_selection import ParameterSampler
# import itertools

NASA_POWER = "https://power.larc.nasa.gov/api/temporal/monthly/point?"

class POWER_API:
    
    def __init__(self,
                 start: Union[date, datetime, pd.Timestamp],
                 end: Union[date, datetime, pd.Timestamp],
                 long: float, lat: float,
                 use_long_names: bool = False,
                 parameter: Optional[List[str]] = None):
        self.start = start
        self.end = end
        self.long = long
        self.lat = lat
        self.use_long_names = use_long_names
        if parameter is None:
            self.parameter = ['T2M_RANGE', 'TS', 'T2MDEW', 'T2MWET', 'T2M_MAX', 'T2M_MIN', 'T2M', 'QV2M', 'RH2M',
                              'PRECTOTCORR', 'PS', 'WS10M', 'WS10M_MAX', 'WS10M_MIN', 'WS10M_RANGE', 'WS50M', 'WS50M_MAX',
                              'WS50M_MIN', 'WS50M_RANGE', 'GWETTOP']
            
        self.request = self._build_request()


    def _build_request(self) -> str:
        r = NASA_POWER
        r += f"parameters={(',').join(self.parameter)}"
        r += '&community=RE'
        r += f"&longitude={self.long}"
        r += f"&latitude={self.lat}"
        r += f"&start={self.start}"
        r += f"&end={self.end}"
        r += '&format=JSON'

        return r
    
    
    def get_weather(self) -> pd.DataFrame:
        response = requests.get(self.request)

        assert response.status_code == 200

        data_json = response.json()

        records = data_json['properties']['parameter']

        df = pd.DataFrame.from_dict(records)

        return df

# Define the calculate_spi function
def calculate_spi(precip, scale=1):
    """
    Calculate Standardized Precipitation Index (SPI).

    Parameters:
    precip (pd.Series): Precipitation data.
    scale (int): Time scale for SPI calculation (e.g., 1 for monthly).

    Returns:
    pd.Series: SPI values.
    """
    # Aggregate to the specified scale
    precip_agg = precip.rolling(window=scale).sum()

    # Remove NaN values
    precip_agg = precip_agg.dropna()

    # Separate positive and zero precipitation values
    positive_precip = precip_agg[precip_agg > 0]
    zero_precip = precip_agg[precip_agg == 0]

    # Fit a gamma distribution to the positive precipitation data
    shape, loc, scale = gamma.fit(positive_precip, floc=0)

    # Calculate the cumulative probability for positive precipitation
    cdf = gamma.cdf(positive_precip, shape, loc=loc, scale=scale)

    # Convert cumulative probability to SPI for positive precipitation
    spi_positive = pd.Series(norm.ppf(cdf),index=positive_precip.index)

    # Assign SPI value of -1.5 to zero precipitation
    spi_zero = pd.Series(-1.5, index=zero_precip.index)

    # Combine the SPI values
    spi = pd.concat([spi_positive, spi_zero]).sort_index()

    return spi

def get_drought_data(latitude, longitude, start_year, end_year):
    latitude= float(latitude)
    longitude= float(longitude)
    nasa_weather = POWER_API(start=start_year, end=end_year, long=longitude, lat=latitude)
    df = nasa_weather.get_weather()

    # naming date column and setting index
    df = df.reset_index()
    df = df.rename(columns={'index': 'Date'})
    df.drop(index=0,inplace=True)
    df['Date']=df['Date'].astype(int)

    # extracting year and month from date
    df['Year'] = df['Date'].astype(str).str[:4].astype(int)
    df['Month'] = df['Date'].astype(str).str[4:].astype(int)

    # filtering out months that are not in the range of 1-12
    df = df[(df['Month'] >= 1) & (df['Month'] <= 12)]

    df['Date'] = pd.to_datetime(df['Year'].astype(str) + df['Month'].astype(str), format='%Y%m')

    df.drop(['Year', 'Month'], axis=1, inplace=True)

    df.set_index('Date', inplace=True)

    df.sort_index(inplace=True)

    # Calculate SPI for precipitation
    spi = calculate_spi(df['PRECTOTCORR'], scale=1)

    # Add SPI to the DataFrame
    df['spi']=spi
    df = df.apply(pd.to_numeric, errors='coerce') # Otherwise SARIMAX will throw an error
    df.dropna(inplace=True)

    return df

def train_model(latitude,longitude,start_year,end_year):
    # Get the drought data
    df = get_drought_data(latitude,longitude,start_year,end_year)
    target = df['spi']
    exog = df[['PS','T2M','QV2M','RH2M','WS10M','PRECTOTCORR','GWETTOP']]

    # Split the data into training and test sets
    train_size = int(len(df) * 0.8)
    train_target, test_target = target[:train_size], target[train_size:]
    train_exog, test_exog = exog[:train_size], exog[train_size:]

    # test_target_copy=test_target.copy()

    train_target = np.asarray(train_target)
    test_target = np.asarray(test_target)
    train_exog = np.asarray(train_exog)
    test_exog = np.asarray(test_exog)

    # Define the parameter grid
    param_grid = {
        'p': range(0, 3),
        'd': range(0, 2),
        'q': range(0, 3),
        'P': range(0, 3),
        'D': range(0, 2),
        'Q': range(0, 3),
        's': [12]  # Seasonality is set to 12 for monthly data
    }

    # Generate a random sample of parameter combinations
    n_iter = 20  # Number of parameter combinations to sample
    param_list = list(ParameterSampler(param_grid, n_iter=n_iter, random_state=42))

    # Perform random search
    best_score, best_cfg = float("inf"), None
    for param in param_list:
        try:
            model = SARIMAX(train_target, exog=train_exog, order=(param['p'], param['d'], param['q']), seasonal_order=(param['P'], param['D'], param['Q'], param['s']))
            model_fit = model.fit(disp=False)
            predictions = model_fit.forecast(steps=len(test_target), exog=test_exog)
            error = mean_squared_error(test_target, predictions)
            if error < best_score:
                best_score, best_cfg = error, param
            print(f"SARIMAX({param['p']}, {param['d']}, {param['q']}, {param['P']}, {param['D']}, {param['Q']}, {param['s']}) MSE={error}")
        except Exception as e:
            print(f"Error with SARIMAX({param['p']}, {param['d']}, {param['q']}, {param['P']}, {param['D']}, {param['Q']}, {param['s']}): {e}")
            continue

    print(f'Best SARIMAX{best_cfg} MSE={best_score}')

    # Fit the best SARIMAX model
    best_model = SARIMAX(target, exog=exog, order=(best_cfg['p'], best_cfg['d'], best_cfg['q']), seasonal_order=(best_cfg['P'], best_cfg['D'], best_cfg['Q'], best_cfg['s']))
    best_model_fit = best_model.fit(disp=False)

    # Save the model for caching purposes
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    # Define the path where you want to create the models folder (directly in "server")
    models_dir = os.path.join(BASE_DIR, 'models')

    # Create the directory if it doesn't exist
    os.makedirs(models_dir, exist_ok=True)

    # Define the model path, ensuring it's within the "server/models" directory
    model_path = os.path.join(models_dir, f'model_{latitude}_{longitude}_{start_year}_{end_year}.pkl')

    # Save the model
    joblib.dump(best_model_fit, model_path)

    return best_model_fit

def train_sarima_exog(feature_data, p=1, d=1, q=1, P=1, D=1, Q=1, s=12, forecast_steps=1):
    """
    Train SARIMA model and forecast future values
    Parameters:
        - feature_data: time series data for the feature
        - p, d, q: ARIMA parameters
        - P, D, Q, s: Seasonal ARIMA parameters
        - forecast_steps: number of future steps to forecast
    """
    # Train SARIMA model
    model = SARIMAX(feature_data, order=(p, d, q), seasonal_order=(P, D, Q, s))
    model_fit = model.fit(disp=False)
    
    # Forecast the next 'forecast_steps' (e.g., next month)
    forecast = model_fit.forecast(steps=forecast_steps)
    return forecast




@api_view(['POST'])
def predict(request):
    # Extract location and exogenous data from request
    location = request.data.get('location') # location is a dictionary with 'latitude' and 'longitude' keys
    latitude = location['latitude']
    longitude = location['longitude']
    start_year = request.data.get('start_year')
    end_year = request.data.get('end_year')

    # Get the base directory, which is "server"
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    # Define the models directory (within server/models)
    models_dir = os.path.join(BASE_DIR, 'models')

    # Define the full model path
    model_path = os.path.join(models_dir, f'model_{latitude}_{longitude}_{start_year}_{end_year}.pkl')
    # Check if the model for this location is already saved
    if os.path.exists(model_path):
        best_model_fit = joblib.load(model_path)  # Load the model from the correct path
    else:
        best_model_fit = train_model(latitude,longitude,start_year,end_year)  # Train and save the model if not already saved
        joblib.dump(best_model_fit, model_path)  # Save the newly trained model to the specified path

    df = get_drought_data(latitude,longitude,start_year,end_year)

    # Get the current date
    current_date = pd.Timestamp.now()

    # Add 6 months to the current date
    new_date = current_date + pd.DateOffset(months=6)

    steps=(new_date.year-end_year)*12 + new_date.month-12

    # Get the exog data
    features = ['PS','T2M','QV2M','RH2M','WS10M','PRECTOTCORR','GWETTOP']
    exog_forecasts = {}

    for feature in features:
        f = np.asarray(df[feature])
        exog_forecasts[feature] = train_sarima_exog(f, p=1, d=1, q=1, P=1, D=1, Q=1, s=12,forecast_steps=steps)
        print(f"Next month's {feature} forecast: {exog_forecasts[feature]}")

    future_exog = pd.DataFrame(exog_forecasts)
    future_exog=future_exog.apply(pd.to_numeric,errors='coerce')
    future_exog.dropna(inplace=True)
    future_exog_np=np.asarray(future_exog)
    
    # Generate forecast
    forecast = best_model_fit.get_forecast(steps=steps, exog=future_exog_np)
    forecast_df = forecast.conf_int() # Get confidence intervals

    # Add the forecasted values (predicted mean) to the DataFrame
    forecast_df['forecast'] = forecast.predicted_mean

    # Add date column for each step in the forecast
    # future_dates = pd.date_range(start=pd.Timestamp(end_year, 12, 31), periods=steps, freq='M')
    # forecast_df['date'] = future_dates

    print("Columns in forecast_df: ", forecast_df.columns)
    print("Head of forecast_df: ", forecast_df.head())
    print("Forecast Index",forecast_df.index)

    # Reset the index to make 'date' a column
    forecast_df = forecast_df.reset_index()

    # Convert to dictionary format, using correct column names
    forecast_response = forecast_df[['index', 'forecast', 'lower spi', 'upper spi']].rename(columns={'index': 'date'}).to_dict(orient='records')

    # Return forecast as JSON response
    return Response(forecast_response)