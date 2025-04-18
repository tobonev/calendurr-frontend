'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSchedule() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    major: '',
    currentSemester: '',
    graduatingSemester: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const requestBody = {
        name: formData.name
      };
      
      console.log('Submitting form data:', requestBody);

      const response = await fetch('http://calendurr-backend.onrender.com/api/v1/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('Received response data:', data);
      } else {
        const text = await response.text();
        console.error('Invalid response:', text);
        throw new Error('Server returned an invalid response');
      }

      if (!response.ok) {
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.error || 'Failed to create plan');
      }

      // The backend returns { plan: { id, ... } }
      const planId = data.plan?.id;
      if (!planId) {
        console.error('No plan ID in response:', data);
        throw new Error('No plan ID received from server');
      }

      console.log('Redirecting to edit page with ID:', planId);
      router.push(`/edit-schedule/${planId}`);
    } catch (error) {
      console.error('Error creating plan:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">Calendurr</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Schedule</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Schedule Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                  Major
                </label>
                <input
                  type="text"
                  id="major"
                  name="major"
                  required
                  value={formData.major}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="currentSemester" className="block text-sm font-medium text-gray-700">
                  Current Semester
                </label>
                <select
                  id="currentSemester"
                  name="currentSemester"
                  required
                  value={formData.currentSemester}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select current semester</option>
                  <option value="Fall 2024">Fall 2024</option>
                  <option value="Spring 2025">Spring 2025</option>
                  <option value="Summer 2025">Summer 2025</option>
                </select>
              </div>

              <div>
                <label htmlFor="graduatingSemester" className="block text-sm font-medium text-gray-700">
                  Graduating Semester
                </label>
                <select
                  id="graduatingSemester"
                  name="graduatingSemester"
                  required
                  value={formData.graduatingSemester}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select graduating semester</option>
                  <option value="Fall 2025">Fall 2025</option>
                  <option value="Spring 2026">Spring 2026</option>
                  <option value="Summer 2026">Summer 2026</option>
                  <option value="Fall 2026">Fall 2026</option>
                  <option value="Spring 2027">Spring 2027</option>
                  <option value="Summer 2027">Summer 2027</option>
                  <option value="Fall 2027">Fall 2027</option>
                  <option value="Spring 2028">Spring 2028</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                {error && (
                  <div className="text-red-600 text-sm mr-4">
                    {error}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => router.push('/home')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Next'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 
