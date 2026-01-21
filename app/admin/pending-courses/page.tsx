'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X, AlertTriangle } from 'lucide-react';

interface PendingCourse {
  id: number;
  ntnu_course_code: string;
  ntnu_course_name: string;
  exchange_university: string;
  exchange_country: string;
  exchange_course_code: string;
  exchange_course_name: string;
  ects: number;
  semester: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export default function PendingCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<PendingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchPendingCourses();
  }, [session, status, router]);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pending-courses');

      if (!response.ok) {
        throw new Error('Failed to fetch pending courses');
      }

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId: number) => {
    if (processingId) return;

    try {
      setProcessingId(courseId);
      const response = await fetch('/api/admin/approve-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve course');
      }

      // Remove approved course from list
      setCourses(prev => prev.filter(c => c.id !== courseId));
      toast.success('Kurs godkjent');
    } catch (err: any) {
      toast.error('Feil ved godkjenning: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = (courseId: number) => {
    if (processingId) return;
    setCourseToDelete(courseId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      setProcessingId(courseToDelete);
      setShowDeleteConfirm(false);
      const response = await fetch(`/api/admin/courses/${courseToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete course');
      }

      // Remove deleted course from list
      setCourses(prev => prev.filter(c => c.id !== courseToDelete));
      toast.success('Kurs slettet');
    } catch (err: any) {
      toast.error('Feil ved sletting: ' + err.message);
    } finally {
      setProcessingId(null);
      setCourseToDelete(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laster...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          Feil: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ventende kurs</h1>
        <p className="mt-2 text-gray-600">
          Gjennomgå og godkjenn kurs som er lagt til av brukere
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">Ingen ventende kurs</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* NTNU Course */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">NTNU-fag</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {course.ntnu_course_code}
                    </p>
                    <p className="text-gray-700">{course.ntnu_course_name}</p>
                  </div>

                  {/* Exchange Course */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Utvekslingsfag</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {course.exchange_course_code}
                    </p>
                    <p className="text-gray-700">{course.exchange_course_name}</p>
                  </div>
                </div>

                {/* Course Details */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-900">
                    {course.exchange_university}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {course.exchange_country}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {course.ects} ECTS
                  </span>
                  {course.semester && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      {course.semester}
                    </span>
                  )}
                </div>

                {/* Submission Info */}
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                  <div className="flex justify-between items-center">
                    <div>
                      Sendt inn av: {course.user_name || course.user_email || 'Anonym'} •{' '}
                      {new Date(course.created_at).toLocaleDateString('nb-NO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleApprove(course.id)}
                    disabled={processingId === course.id}
                    className="flex-1 bg-primary hover:bg-primary-hover disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {processingId === course.id ? 'Godkjenner...' : 'Godkjenn'}
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    disabled={processingId === course.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {processingId === course.id ? 'Sletter...' : 'Slett'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setCourseToDelete(null);
              }}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Slett kurs
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Er du sikker på at du vil slette dette kurset? Dette kan ikke angres.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCourseToDelete(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Slett
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
