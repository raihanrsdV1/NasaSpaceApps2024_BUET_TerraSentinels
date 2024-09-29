import React from "react";
import HelloFromServer from "./components/HelloFromServer";
import WeatherData2DGraph from "./components/WeatherData2dGraph";

const App: React.FC = () => {
  return (
    <div>
      <HelloFromServer />
      <WeatherData2DGraph
        latitude={37.7749}
        longitude={-122.4194}
        startDate="20210101"
        endDate="20210131"
        parameter="PRECTOTCORR"
        label="Surface Temperature"
      />
    </div>
  );
};

export default App;
