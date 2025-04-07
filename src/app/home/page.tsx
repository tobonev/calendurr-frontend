'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface User {
  email: string;
}

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

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  //default courses to test drag/drop
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', code: 'CIS4930', name: 'Internet Programming', credits: 3 },
    { id: '2', code: 'COP4530', name: 'Data Structures', credits: 3 },
    { id: '3', code: 'COP4600', name: 'Operating Systems', credits: 3 },
    { id: '4', code: 'CEN4010', name: 'Software Engineering', credits: 3 },
  ]);
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: 'fall1', name: 'Fall 2024', courses: [] },
    { id: 'spring1', name: 'Spring 2025', courses: [] },
    { id: 'summer1', name: 'Summer 2025', courses: [] },
    { id: 'fall2', name: 'Fall 2025', courses: [] },
    { id: 'spring2', name: 'Spring 2026', courses: [] },
    { id: 'summer2', name: 'Summer 2026', courses: [] },
  ]);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
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

        // Load saved schedule
        const scheduleResponse = await fetch('http://localhost:5000/api/v1/schedule', {
          credentials: 'include',
        });
        
        if (scheduleResponse.ok) {
          const scheduleData = await scheduleResponse.json();
          setSemesters(scheduleData.semesters);
          setCourses(scheduleData.availableCourses);
        }
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const saveSchedule = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          semesters,
          availableCourses: courses,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save schedule');
      }

      alert('Schedule saved successfully!');
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule. Please try again.');
    }
  };

  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Moving from course list to semester
    if (source.droppableId === 'courses') {
      const course = courses[source.index];
      const newSemesters = [...semesters];
      const targetSemester = newSemesters.find(s => s.id === destination.droppableId);
      
      if (targetSemester) {
        // Remove from available courses
        const newCourses = courses.filter((_, index) => index !== source.index);
        setCourses(newCourses);
        
        // Add to semester
        targetSemester.courses.splice(destination.index, 0, course);
        setSemesters(newSemesters);
      }
    }
    // Moving between semesters
    else if (destination.droppableId !== 'courses') {
      const sourceSemester = semesters.find(s => s.id === source.droppableId);
      const destSemester = semesters.find(s => s.id === destination.droppableId);
      
      if (sourceSemester && destSemester) {
        const [movedCourse] = sourceSemester.courses.splice(source.index, 1);
        destSemester.courses.splice(destination.index, 0, movedCourse);
        setSemesters([...semesters]);
      }
    }
    // Moving from semester back to available courses
    else {
      const sourceSemester = semesters.find(s => s.id === source.droppableId);
      
      if (sourceSemester) {
        const [movedCourse] = sourceSemester.courses.splice(source.index, 1);
        setSemesters([...semesters]);
        
        // Add back to available courses
        setCourses(prevCourses => [...prevCourses, movedCourse]);
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
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user.email}</span>
                <button
                  onClick={() => {
                    // TODO: Implement logout
                    router.push('/login');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Available Courses */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Available Courses</h2>
                  <Droppable droppableId="courses">
                    {(provided: any) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2 min-h-[200px]"
                      >
                        {courses.map((course, index) => (
                          <Draggable key={course.id} draggableId={course.id} index={index}>
                            {(provided: any) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-indigo-50 p-3 rounded-lg cursor-move hover:bg-indigo-100"
                              >
                                <div className="font-medium text-indigo-700">{course.code}</div>
                                <div className="text-sm text-gray-600">{course.name}</div>
                                <div className="text-xs text-gray-500">{course.credits} credits</div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>

              {/* Semester Schedule */}
              <div className="lg:col-span-3">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Semester Schedule</h2>
                    <button
                      onClick={saveSchedule}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Save Schedule
                    </button>
                  </div>
                  <div className="space-y-4">
                    {semesters.map((semester) => (
                      <div key={semester.id} className="border rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">{semester.name}</h3>
                        <Droppable droppableId={semester.id}>
                          {(provided: any) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="min-h-[100px] bg-gray-50 rounded p-2"
                            >
                              {semester.courses.map((course, index) => (
                                <Draggable key={course.id} draggableId={course.id} index={index}>
                                  {(provided: any) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="bg-white p-2 rounded shadow-sm mb-2 cursor-move hover:bg-gray-50"
                                    >
                                      <div className="font-medium text-indigo-700">{course.code}</div>
                                      <div className="text-sm text-gray-600">{course.name}</div>
                                      <div className="text-xs text-gray-500">{course.credits} credits</div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DragDropContext>
        </div>
      </main>
    </div>
  );
} 