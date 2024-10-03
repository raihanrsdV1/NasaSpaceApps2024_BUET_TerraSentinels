from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import gamma,norm
from pathlib import Path

from typing import List, Union, Optional
from datetime import date, datetime
import requests
import os

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


    
