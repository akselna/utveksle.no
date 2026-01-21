'use client';

import { Exchange } from '../lib/types';
import { useState } from 'react';

interface ExchangeGridProps {
  exchanges: Exchange[];
}

export default function ExchangeGrid({ exchanges }: ExchangeGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (exchanges.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-xl">Ingen utvekslinger funnet. Prøv å justere søkekriteriene.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {exchanges.map((exchange) => {
          const isExpanded = expandedId === exchange.id;
          const courses = [
            ...(exchange.courses.Høst || []),
            ...(exchange.courses.Vår || []),
          ];
          const totalCourses = courses.length;

          return (
            <div
              key={exchange.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200/50 hover:border-gray-300/50 hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {exchange.university}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm font-medium">
                      {exchange.country}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {exchange.study}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-medium">Studieår:</span> {exchange.studyYear}
                  </p>
                  <p>
                    <span className="font-medium">Semestre:</span> {exchange.numSemesters}
                  </p>
                  <p>
                    <span className="font-medium">År:</span> {exchange.year}
                  </p>
                  {exchange.specialization !== 'Ingen spesialisering' && (
                    <p>
                      <span className="font-medium">Spesialisering:</span> {exchange.specialization}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{totalCourses}</span> kurs
                    {exchange.courses.Høst && exchange.courses.Høst.length > 0 && (
                      <span className="ml-2">
                        ({exchange.courses.Høst.length} høst
                        {exchange.courses.Vår && exchange.courses.Vår.length > 0 && (
                          <span>, {exchange.courses.Vår.length} vår</span>
                        )}
                        )
                      </span>
                    )}
                  </p>
                </div>

                {totalCourses > 0 && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : exchange.id)}
                    className="w-full text-gray-900 hover:text-gray-700 font-medium text-sm py-2 transition-colors"
                  >
                    {isExpanded ? 'Skjul kurs' : 'Vis kurs'}
                  </button>
                )}
              </div>

              {/* Expanded courses list */}
              {isExpanded && totalCourses > 0 && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-4">Kurs</h4>
                  <div className="space-y-4">
                    {exchange.courses.Høst && exchange.courses.Høst.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Høst</h5>
                        <ul className="space-y-2">
                          {exchange.courses.Høst.map((course, idx) => (
                            <li key={idx} className="text-sm text-gray-600">
                              <span className="font-medium">{course.courseCode}</span> - {course.courseName}
                              {course.ECTSPoints && (
                                <span className="text-gray-500 ml-2">({course.ECTSPoints} ECTS)</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {exchange.courses.Vår && exchange.courses.Vår.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Vår</h5>
                        <ul className="space-y-2">
                          {exchange.courses.Vår.map((course, idx) => (
                            <li key={idx} className="text-sm text-gray-600">
                              <span className="font-medium">{course.courseCode}</span> - {course.courseName}
                              {course.ECTSPoints && (
                                <span className="text-gray-500 ml-2">({course.ECTSPoints} ECTS)</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

