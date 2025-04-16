'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface User {
  id: string;
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

interface Schedule {
  id: string;
  name: string;
  major: string;
  currentSemester: string;
  graduatingSemester: string;
}

export default function EditSchedule() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const authResponse = await fetch('http://localhost:5000/api/v1/auth/me', {
          credentials: 'include',
        });

        if (!authResponse.ok) {
          router.push('/login');
          return;
        }

        const data = await authResponse.json();
        setUser(data.user);

        // Load schedule data
        const scheduleResponse = await fetch(`http://localhost:5000/api/v1/plans/${params.id}`, {
          credentials: 'include',
        });
        
        if (!scheduleResponse.ok) {
          throw new Error('Failed to load schedule');
        }

        const scheduleData = await scheduleResponse.json();
        setSchedule(scheduleData.plan);
        setSemesters(scheduleData.semesters || []);
        setCourses(scheduleData.availableCourses || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, params.id]);

  const saveSchedule = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/plans/${params.id}`, {
        method: 'PUT',
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user || !schedule) {
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{schedule.name}</h1>
              <p className="text-sm text-gray-500">
                {schedule.major} • {schedule.currentSemester} - {schedule.graduatingSemester}
              </p>
            </div>
            <button
              onClick={saveSchedule}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save Schedule
            </button>
          </div>

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
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Semester Schedule</h2>
                  <div className="space-y-4">
                    {semesters && semesters.length > 0 ? (
                      semesters.map((semester) => (
                        <div key={semester.id} className="border rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 mb-2">{semester.name}</h3>
                          <Droppable droppableId={semester.id}>
                            {(provided: any) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-2 min-h-[50px]"
                              >
                                {semester.courses.map((course, index) => (
                                  <Draggable key={course.id} draggableId={course.id} index={index}>
                                    {(provided: any) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="bg-gray-50 p-3 rounded-lg cursor-move hover:bg-gray-100"
                                      >
                                        <div className="font-medium text-gray-700">{course.code}</div>
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
                      ))
                    ) : (
                      <div className="text-gray-500 text-center py-4">
                        No semesters added yet
                      </div>
                    )}
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