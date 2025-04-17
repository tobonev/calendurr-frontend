'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

interface Schedule {
  id: string;
  name: string;
  major: string;
  currentSemester: string;
  graduatingSemester: string;
  lastModified: string;
}

export default function Home() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/v1/auth/me', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          router.push('/login');
          return;
        }
        
        const data = await response.json();
        setUser(data.user);

        // Load saved schedules
        const schedulesResponse = await fetch('http://localhost:5000/api/v1/plans', {
          credentials: 'include',
        });
        
        if (schedulesResponse.ok) {
          const schedulesData = await schedulesResponse.json();
          console.log(schedulesData.plans);
          setSchedules(schedulesData.plans);
        }
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleDelete = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/v1/plans/${scheduleId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.email}</span>
              <button
                onClick={() => router.push('/login')}
                className="text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Schedules</h1>
            <Link
              href="/create-schedule"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" />
              Add Schedule
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-medium text-gray-900">{schedule.name}</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/edit-schedule/${schedule.id}`)}
                      className="text-gray-400 hover:text-indigo-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {schedules.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No schedules found. Create your first schedule to get started!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 