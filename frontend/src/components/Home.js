import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

function Home() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeId, setTypeId] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    // Fetch vehicle types on mount
    api.get('/vehicles/types')
      .then(res => setTypes(res.data.types))
      .catch(err => console.error('Error fetching types:', err));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = { startDate, endDate };
      if (typeId) params.type_id = typeId;

      const response = await api.get('/vehicles/search', { params });
      setVehicles(response.data.vehicles);
      
      if (response.data.vehicles.length === 0) {
        setError('No vehicles available for the selected dates');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error searching vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (vehicleId) => {
    navigate(`/booking/${vehicleId}?startDate=${startDate}&endDate=${endDate}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Find Your Perfect Vehicle
        </h1>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type (Optional)
                </label>
                <select
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {types.map(type => (
                    <option key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search Vehicles'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Vehicle Results */}
        {vehicles.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Available Vehicles ({vehicles.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(vehicle => (
                <div
                  key={vehicle.vehicle_id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {vehicle.year}{vehicle.color && ` • ${vehicle.color}`}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                        {vehicle.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> {vehicle.type_name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">License:</span> {vehicle.license_plate}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          ${vehicle.daily_rate}
                        </p>
                        <p className="text-xs text-gray-500">per day</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookNow(vehicle.vehicle_id)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;