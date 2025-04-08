'use client';

import { useEffect, useState } from 'react';

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
}

interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export default function ModelPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);

  useEffect(() => {
    setSemesters([
      {
        id: 'fall1',
        name: 'Fall 2024',
        courses: [
          { id: '2', code: 'COP4530', name: 'Data Structures', credits: 3 },
        ],
      },
      {
        id: 'spring1',
        name: 'Spring 2025',
        courses: [
          { id: '1', code: 'CIS4930', name: 'Internet Programming', credits: 3 },
          { id: '4', code: 'CEN4010', name: 'Software Engineering', credits: 3 },
        ],
      },
      {
        id: 'summer1',
        name: 'Summer 2025',
        courses: [],
      },
      {
        id: 'fall2',
        name: 'Fall 2025',
        courses: [
          { id: '3', code: 'COP4600', name: 'Operating Systems', credits: 3 },
        ],
      },
      {
        id: 'spring2',
        name: 'Spring 2026',
        courses: [],
      },
      {
        id: 'summer2',
        name: 'Summer 2026',
        courses: [],
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-indigo-600">Calendurr</h1>
            <button
              onClick={() => window.location.href = '/home'}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Planner
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Model Semesters</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Available Courses column removed in Model view */}

          {/* Semester Columns */}
          <div className="lg:col-span-4">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                {semesters.map((semester) => (
                  <div key={semester.id} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{semester.name}</h3>
                    <div className="min-h-[100px] bg-gray-50 rounded p-2">
                      {semester.courses.length > 0 ? (
                        semester.courses.map((course) => (
                          <div
                            key={course.id}
                            className="bg-white p-2 rounded shadow-sm mb-2"
                          >
                            <div className="font-medium text-indigo-700">{course.code}</div>
                            <div className="text-sm text-gray-600">{course.name}</div>
                            <div className="text-xs text-gray-500">{course.credits} credits</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">No courses assigned</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
