'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CourseCard from '@/app/components/CourseCard';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  email: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  types?: string[];
  repeatable?: boolean;
}

interface Semester {
  id: string;
  name: string;
  isCreditsAcquired?: boolean;
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
  const [showModal, setShowModal] = useState(false);
  const [newTerm, setNewTerm] = useState('Fall');
  const [newYear, setNewYear] = useState('');
  const TOTAL_CREDIT_GOAL = 120;

  useEffect(() => {

    setSemesters([{ id: uuidv4(), name: 'Transfer Credits', isCreditsAcquired: true, courses: [] }]);

    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const authResponse = await fetch('https://calendurr-backend.onrender.com/api/v1/auth/me', {
          credentials: 'include',
        });

        if (!authResponse.ok) {
          router.push('/login');
          return;
        }

        const data = await authResponse.json();
        setUser(data.user);

        // Load schedule data
        const scheduleResponse = await fetch(`https://calendurr-backend.onrender.com/api/v1/plans/${params.id}`, {
          credentials: 'include',
        });
        
        if (!scheduleResponse.ok) {
          throw new Error('Failed to load schedule');
        }

        const scheduleData = await scheduleResponse.json();
        setSchedule(scheduleData.plan);
        //setSemesters(scheduleData.semesters || []);
        setCourses(scheduleData.availableCourses || []);
        if (courses.length === 0) {
          fetchCourses();
        }
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

  const fetchCourses = async () => {
    try {
      const response = await fetch('https://calendurr-backend.onrender.com/api/v1/courses', {
        credentials: 'include',
      });

      const rawData = await response.json();

      const mappedCourses: Course[] = rawData.courses.map((course: any) => ({
        id: course.id,
        name: course.name,
        code: course.code,
        credits: course.credit_hours,
        repeatable: course.repeatable,
      }));

      setCourses(mappedCourses);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const addSemester = () => {
    if (!newYear.trim()) return;
    setSemesters(prev => [...prev, {
      id: uuidv4(),
      name: `${newTerm} ${newYear}`,
      courses: []
    }]);
    setShowModal(false);
    setNewYear('');
  };

  const removeSemester = (id: string) => {
    const target = semesters.find(s => s.id === id);
    if (target && target.courses.length > 0) {
      alert('Please remove all courses from this semester before deleting it.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this semester?')) {
      setSemesters(prev => prev.filter(s => s.id !== id));
    }
  };

  const saveSchedule = async () => {
    try {
      const response = await fetch(`https://calendurr-backend.onrender.com/api/v1/plans/${params.id}`, {
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
      router.push('/home');
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule. Please try again.');
    }
  };

  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    
    // If there's no destination or the item is dropped in the same place, do nothing
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    // Case 1: Moving from courses list to a semester
    if (source.droppableId === 'courses' && destination.droppableId !== 'courses') {
      const courseToMove = courses[source.index];
      const destinationSemester = semesters.find(sem => sem.id === destination.droppableId);
      if (!destinationSemester) return;
      
      // Create new arrays to avoid mutation
      const newCourses = courseToMove.repeatable 
        ? [...courses] 
        : courses.filter((_, idx) => idx !== source.index);
        
      const newSemesters = semesters.map(sem => {
        if (sem.id === destination.droppableId) {
          const newCourses = [...sem.courses];
          newCourses.splice(destination.index, 0, courseToMove);
          return { ...sem, courses: newCourses };
        }
        return sem;
      });
      
      setCourses(newCourses);
      setSemesters(newSemesters);
    }
    
    // Case 2: Moving from a semester to courses list
    else if (source.droppableId !== 'courses' && destination.droppableId === 'courses') {
      const sourceSemester = semesters.find(sem => sem.id === source.droppableId);
      if (!sourceSemester) return;
      
      const courseToMove = sourceSemester.courses[source.index];
      
      const newSemesters = semesters.map(sem => {
        if (sem.id === source.droppableId) {
          const newCourses = [...sem.courses];
          newCourses.splice(source.index, 1);
          return { ...sem, courses: newCourses };
        }
        return sem;
      });
      
      const newCourses = [...courses];
      newCourses.splice(destination.index, 0, courseToMove);
      
      setCourses(newCourses);
      setSemesters(newSemesters);
    }
    
    // Case 3: Moving from one semester to another
    else if (source.droppableId !== 'courses' && destination.droppableId !== 'courses') {
      const sourceSemester = semesters.find(sem => sem.id === source.droppableId);
      if (!sourceSemester) return;
      
      const courseToMove = sourceSemester.courses[source.index];
      
      const newSemesters = semesters.map(sem => {
        // Remove from source semester
        if (sem.id === source.droppableId) {
          const newCourses = [...sem.courses];
          newCourses.splice(source.index, 1);
          return { ...sem, courses: newCourses };
        }
        // Add to destination semester
        else if (sem.id === destination.droppableId) {
          const newCourses = [...sem.courses];
          newCourses.splice(destination.index, 0, courseToMove);
          return { ...sem, courses: newCourses };
        }
        return sem;
      });
      
      setSemesters(newSemesters);
    }
    
    // Case 4: Moving within courses list (if applicable)
    else if (source.droppableId === 'courses' && destination.droppableId === 'courses') {
      const newCourses = [...courses];
      const [moved] = newCourses.splice(source.index, 1);
      newCourses.splice(destination.index, 0, moved);
      setCourses(newCourses);
    }
  };

  const totalPlannedCredits = semesters.reduce((sum, sem) => sum + sem.courses.reduce((s, c) => s + c.credits, 0), 0);
  const creditPercentage = Math.min((totalPlannedCredits / TOTAL_CREDIT_GOAL) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <h1 className="text-xl font-bold text-indigo-600 mt-6">Calendurr</h1>
            <div className="space-x-4 flex items-center">
              <span className="text-gray-700">{user?.email || 'Guest Mode'}</span>
              <button onClick={() => router.push('/login')} className="text-gray-500 hover:text-gray-700">Logout</button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-8xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Available Courses</h2>
                  <Droppable droppableId="courses">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-2 gap-2 min-h-[200px]">
                        {courses.map((course, index) => (
                          <Draggable key={course.id} draggableId={course.id} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                <CourseCard {...course} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <div className="flex flex-col items-center mt-6">
                    <svg className="w-24 h-24" viewBox="0 0 36 36">
                      <path className="text-gray-200" stroke="currentColor" strokeWidth="3.8" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-indigo-600" stroke="currentColor" strokeWidth="3.8" strokeDasharray={`${creditPercentage}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <text x="18" y="20.35" className="fill-current text-indigo-700 text-sm" textAnchor="middle">{Math.floor(creditPercentage)}%</text>
                    </svg>
                    <p className="text-sm text-gray-600 mt-2">{totalPlannedCredits} / {TOTAL_CREDIT_GOAL} Credits</p>
                    <p className="text-xs text-gray-500">{creditPercentage >= 100 ? "Goal Reached!" : "Keep going!"}</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Semester Schedule</h2>
                    <div className="flex gap-2">
                      <button onClick={() => setShowModal(true)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300">+</button>
                      <button onClick={saveSchedule} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Save Schedule</button>
                      <button onClick={() => { if (window.confirm('Warning: Navigating to the Model Semesters Page Without Saving May Result In Loss of Your Schedule')) router.push('/model'); }} className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300">Model Semesters</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {semesters.map((semester) => (
                      <div key={semester.id} className="border rounded-lg p-4 relative">
                        <h3 className="font-medium text-gray-900 mb-2">{semester.name}
                          {!semester.isCreditsAcquired && (
                            <button onClick={() => removeSemester(semester.id)} className="absolute right-2 top-2 bg-red-100 text-red-600 px-2 rounded hover:bg-red-200">-</button>
                          )}
                        </h3>
                        <Droppable droppableId={semester.id}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[100px] bg-gray-50 rounded p-2">
                              {semester.courses.map((course, index) => (
                                <Draggable key={course.id} draggableId={course.id} index={index}>
                                  {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                      <CourseCard {...course} />
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-[300px] space-y-4 border border-indigo-200">
            <h3 className="text-lg font-semibold text-indigo-700">Add Semester?</h3>
            <div className="flex gap-2">
              <select value={newTerm} onChange={(e) => setNewTerm(e.target.value)} className="border p-2 rounded w-1/2 text-gray-700">
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
              </select>
              <input type="text" placeholder="Enter year..." value={newYear} onChange={(e) => setNewYear(e.target.value)} className="border p-2 rounded w-1/2 placeholder-gray-600 text-gray-700" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={addSemester} className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
