
const WaterSource = () => {
    return (
      <div className="water-sources-block">
        <div className="water-sources-header">Water Sources</div>
        <div className="nearest-sources">
          <div> 2.7 km Meghna River</div>
          <div> 3.1 km Rahimpur Well</div>
        </div>
        <div className="comparison-header">Comparison of Water Level in Sources:</div>
        <div className="water-level-chart">
          <div>Groundwater</div>
          <div>Irrigation Canal</div>
          <div>Reservoir</div>
        </div>
      </div>
    );
  };
  
  export default WaterSource;

  // hardcoded, need to check whats required
  