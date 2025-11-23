import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../config/api';

function Booking() {
  const { vehicleId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState(null);
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [rentalInfo, setRentalInfo] = useState(null);

  useEffect(() => {
    // Get customer from localStorage
    const customer = JSON.parse(localStorage.getItem('customer') || 'null');
    if (customer) {
      setCustomerId(customer.customer_id);
    }

    // Fetch vehicle details
    api.get(`/vehicles/${vehicleId}`)
      .then(res => setVehicle(res.data.vehicle))
      .catch(err => {
        setError('Error loading vehicle details');
        console.error(err);
      });
  }, [vehicleId]);

  const calculateCost = () => {
    if (!startDate || !endDate || !vehicle) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days * parseFloat(vehicle.daily_rate);
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!customerId) {
      setError('Please login to continue booking');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/rental/book', {
        customer_id: customerId,
        vehicle_id: vehicleId,
        startDate,
        endDate
      });

      setRentalInfo(response.data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading vehicle details...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Complete Your Booking
        </h1>

        {success && rentalInfo ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Booking Confirmed!
            </h2>
            <div className="space-y-2 mb-6">
              <p className="text-gray-700">
                <span className="font-semibold">Rental ID:</span> {rentalInfo.rental_id}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Total Cost:</span> ${rentalInfo.calculated_cost.toFixed(2)}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Duration:</span> {rentalInfo.days} day(s)
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Return to Home
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {vehicle.make} {vehicle.model}
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Year:</span>
                  <p className="font-medium">{vehicle.year}</p>
                </div>
                {vehicle.color && (
                  <div>
                    <span className="text-sm text-gray-600">Color:</span>
                    <p className="font-medium">{vehicle.color}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">License Plate:</span>
                  <p className="font-medium">{vehicle.license_plate}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Type:</span>
                  <p className="font-medium">{vehicle.type_name || 'N/A'}</p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-3xl font-bold text-blue-600">
                    ${vehicle.daily_rate}
                    <span className="text-sm text-gray-500 font-normal">/day</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Booking Details
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {!customerId && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                  Please <a href="/login" className="underline">login</a> to continue booking.
                </div>
              )}

              <form onSubmit={handleBooking} className="space-y-4">
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

                {startDate && endDate && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Days:</span>
                      <span className="font-semibold">
                        {Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} day(s)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${calculateCost().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !customerId}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Booking;

