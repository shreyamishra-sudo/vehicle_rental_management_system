import React, { useState } from 'react';
import api from '../config/api';

function Admin() {
  const [rentalId, setRentalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [returnInfo, setReturnInfo] = useState(null);

  const handleReturn = async (e) => {
    e.preventDefault();
    
    if (!rentalId) {
      setError('Please enter a rental ID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setReturnInfo(null);

    try {
      const response = await api.put(`/rental/return/${rentalId}`);
      setReturnInfo(response.data);
      setSuccess(true);
      setRentalId('');
    } catch (err) {
      setError(err.response?.data?.error || 'Return processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Admin - Vehicle Return
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 mb-6">
            Enter the rental ID to process a vehicle return. This will update the rental status,
            mark the vehicle as available, and process the final payment.
          </p>

          <form onSubmit={handleReturn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rental ID
              </label>
              <input
                type="number"
                value={rentalId}
                onChange={(e) => setRentalId(e.target.value)}
                placeholder="Enter rental ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Return...' : 'Process Return'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && returnInfo && (
            <div className="mt-4 p-4 bg-green-50 border border-green-400 rounded">
              <h3 className="font-semibold text-green-800 mb-2">Return Processed Successfully!</h3>
              <div className="space-y-1 text-sm text-green-700">
                <p><span className="font-medium">Rental ID:</span> {returnInfo.rental_id}</p>
                <p><span className="font-medium">Final Amount:</span> ${returnInfo.final_amount.toFixed(2)}</p>
                <p><span className="font-medium">Return Date:</span> {new Date(returnInfo.return_date).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;