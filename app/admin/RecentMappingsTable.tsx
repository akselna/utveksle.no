"use client";

import { useState } from "react";
import { Trash2, Loader2, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function RecentMappingsTable({ mappings }: { mappings: any[] }) {
  const [currentMappings, setMappings] = useState(mappings);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mappingToDelete, setMappingToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setMappingToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!mappingToDelete) return;

    setDeletingId(mappingToDelete);
    setShowDeleteConfirm(false);

    try {
      const res = await fetch(`/api/admin/mappings?id=${mappingToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete mapping");
      }

      setMappings((prev) => prev.filter((m) => m.id !== mappingToDelete));
      toast.success("Fagkobling slettet");
    } catch (error: any) {
      toast.error(`Kunne ikke slette kobling: ${error.message}`);
    } finally {
      setDeletingId(null);
      setMappingToDelete(null);
    }
  };

  if (currentMappings.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No new course mappings in the last 14 days.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              University
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Foreign Course
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Replaces (NTNU)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Added By
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentMappings.map((mapping) => (
            <tr key={mapping.id} className="hover:bg-gray-50 group">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  {new Date(mapping.created_at).toLocaleDateString()}
                  {!mapping.verified && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      New
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {mapping.university_name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="font-medium">{mapping.foreign_code}</div>
                <div className="text-gray-500 text-xs truncate max-w-[200px]">
                  {mapping.foreign_name}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="font-medium">{mapping.replaced_course_code}</div>
                <div className="text-gray-500 text-xs truncate max-w-[200px]">
                  {mapping.replaced_course_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {mapping.user_name || "Anonymous"}
                {mapping.user_email && <div className="text-xs text-gray-400">{mapping.user_email}</div>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleDelete(mapping.id)}
                  disabled={deletingId === mapping.id}
                  className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete Mapping"
                >
                  {deletingId === mapping.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
                setMappingToDelete(null);
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
              Slett fagkobling
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Er du sikker på at du vil slette denne fagkoblingen? Dette kan ikke angres.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setMappingToDelete(null);
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
