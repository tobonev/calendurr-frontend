'use client';

import { useEffect, useState } from 'react';

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number | string;
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
        id: 'fall2024',
        name: 'Fall 2024',
        courses: [
          { id: 'q1', code: 'Quest 1', name: 'Gen Ed Humanities', credits: 3 },
          { id: 'cop3502c', code: 'COP 3502C', name: 'Programming Fundamentals 1', credits: 4 },
          { id: 'mac2311', code: 'MAC 2311', name: 'Analytic Geometry and Calculus 1', credits: 4 },
          { id: 'composition', code: 'Composition', name: 'State Core Gen Ed Composition; Writing', credits: 3 },
        ],
      },
      {
        id: 'spring2025',
        name: 'Spring 2025',
        courses: [
          { id: 'cop3503c', code: 'COP 3503C', name: 'Programming Fundamentals 2', credits: 4 },
          { id: 'cot3100', code: 'COT 3100', name: 'Applications of Discrete Structures', credits: 3 },
          { id: 'mac2312', code: 'MAC 2312', name: 'Analytic Geometry and Calculus 2', credits: 4 },
          { id: 'phy1', code: 'PHY 2048 / 2053 + Lab', name: 'Physics 1 w/ Lab (Select one)', credits: '4–5' },
        ],
      },
      {
        id: 'summer2025',
        name: 'Summer 2025',
        courses: [
          { id: 'bio', code: 'Biological Sciences', name: 'State Core Gen Ed', credits: 3 },
          { id: 'sbs1', code: 'Social & Behavioral Sciences', name: 'State Core Gen Ed', credits: 3 },
          { id: 'hum2', code: 'Humanities', name: 'Gen Ed', credits: 3 },
        ],
      },
      {
        id: 'fall2025',
        name: 'Fall 2025',
        courses: [
          { id: 'cda3101', code: 'CDA 3101', name: 'Intro to Computer Organization', credits: 3 },
          { id: 'cop3530', code: 'COP 3530', name: 'Data Structures and Algorithm', credits: 3 },
          { id: 'mac2313', code: 'MAC 2313', name: 'Analytic Geometry and Calculus 3', credits: 4 },
          { id: 'phy2', code: 'PHY 2049 / 2054 + Lab', name: 'Physics 2 w/ Lab (Select one)', credits: '4–5' },
        ],
      },
      {
        id: 'spring2026',
        name: 'Spring 2026',
        courses: [
          { id: 'q2', code: 'Quest 2', name: 'Gen Ed Bio/Social & Behavioral Sci', credits: 3 },
          { id: 'cen3031', code: 'CEN 3031', name: 'Intro to Software Engineering', credits: 3 },
          { id: 'cis4301', code: 'CIS 4301', name: 'Information and Database Systems 1', credits: 3 },
          { id: 'enc3246', code: 'ENC 3246', name: 'Professional Communication for Engineers', credits: 3 },
          { id: 'mas', code: 'MAS 3114 / 4105', name: 'Computational or Linear Algebra', credits: '3–4' },
        ],
      },
      {
        id: 'summer2026',
        name: 'Summer 2026',
        courses: [
          { id: 'internship', code: 'Internship/Co-op', name: 'Pursue if desired', credits: 0 },
        ],
      },
      {
        id: 'fall2026',
        name: 'Fall 2026',
        courses: [
          { id: 'sbs2', code: 'SBS or Bio', name: 'Gen Ed Area not taken in Q2', credits: 3 },
          { id: 'hum3', code: 'Humanities', name: 'Gen Ed', credits: 3 },
          { id: 'teche1', code: 'Technical Elective', name: '', credits: 3 },
          { id: 'teche2', code: 'Technical Elective', name: '', credits: 3 },
          { id: 'lang1', code: 'Foreign Language / Elective', name: 'If 4-3-3 path', credits: 3 },
        ],
      },
      {
        id: 'spring2027',
        name: 'Spring 2027',
        courses: [
          { id: 'cis4914', code: 'CIS 4914', name: 'Senior Project', credits: 3 },
          { id: 'teche3', code: 'Technical Elective', name: '', credits: 3 },
          { id: 'elec1', code: 'Elective', name: '', credits: 3 },
          { id: 'elec2', code: 'Elective', name: '', credits: 4 },
        ],
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Model Semesters</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
