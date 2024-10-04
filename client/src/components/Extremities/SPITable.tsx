import React from 'react';

const SPITable: React.FC = () => {
  const spiCategories = [
    { spi: '< -2.0', drought: 'Extremely Dry' },
    { spi: '-1.5 to -1.99', drought: 'Severely Dry' },
    { spi: '-1.0 to -1.49', drought: 'Moderately Dry' },
    { spi: '-0.99 to 0.99', drought: 'Near Normal' },
    { spi: '1.0 to 1.49', drought: 'Moderately Wet' },
    { spi: '1.5 to 1.99', drought: 'Severely Wet' },
    { spi: '> 2.0', drought: 'Extremely Wet' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">SPI to Drought Relationship</h2>
      <table className="table-auto w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">SPI Range</th>
            <th className="px-4 py-2 text-left">Drought Category</th>
          </tr>
        </thead>
        <tbody>
          {spiCategories.map((category, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2">{category.spi}</td>
              <td className="px-4 py-2">{category.drought}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SPITable;
