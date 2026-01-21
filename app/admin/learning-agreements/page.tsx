"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FileText, Download, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";

interface LearningAgreement {
  id: number;
  pdf_url: string;
  cloudinary_public_id: string;
  uploaded_at: string;
  behandlet: boolean;
  behandlet_dato: string | null;
  user_name: string;
  user_email: string;
  behandlet_av_name: string | null;
}

export default function AdminLearningAgreementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [agreements, setAgreements] = useState<LearningAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      const res = await fetch("/api/admin/learning-agreements");
      if (res.ok) {
        const data = await res.json();
        setAgreements(data.agreements);
      } else {
        toast.error("Kunne ikke hente learning agreements");
      }
    } catch (error) {
      console.error("Error fetching agreements:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBehandlet = async (id: number, currentStatus: boolean) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/learning-agreements", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          behandlet: !currentStatus,
        }),
      });

      if (res.ok) {
        await fetchAgreements(); // Refresh list
        toast.success("Status oppdatert");
      } else {
        toast.error("Kunne ikke oppdatere status");
      }
    } catch (error) {
      console.error("Error updating agreement:", error);
      toast.error("En feil oppstod");
    } finally {
      setUpdating(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Laster...</div>
      </div>
    );
  }

  const pendingAgreements = agreements.filter((a) => !a.behandlet);
  const completedAgreements = agreements.filter((a) => a.behandlet);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-4">
            Learning Agreements
          </h1>
          <p className="text-lg text-gray-600">
            {pendingAgreements.length} venter på behandling •{" "}
            {completedAgreements.length} behandlet
          </p>
        </div>

        {/* Pending Agreements */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Venter på behandling ({pendingAgreements.length})
          </h2>

          {pendingAgreements.length === 0 ? (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">
                Ingen learning agreements venter på behandling
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAgreements.map((agreement) => (
                <AgreementCard
                  key={agreement.id}
                  agreement={agreement}
                  onToggle={toggleBehandlet}
                  isUpdating={updating === agreement.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed Agreements */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Behandlet ({completedAgreements.length})
          </h2>

          {completedAgreements.length === 0 ? (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Ingen behandlede agreements ennå</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedAgreements.map((agreement) => (
                <AgreementCard
                  key={agreement.id}
                  agreement={agreement}
                  onToggle={toggleBehandlet}
                  isUpdating={updating === agreement.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgreementCard({
  agreement,
  onToggle,
  isUpdating,
}: {
  agreement: LearningAgreement;
  onToggle: (id: number, currentStatus: boolean) => void;
  isUpdating: boolean;
}) {
  // Generate custom filename: LA_USERNAME_DDMMYYYY
  const userName = agreement.user_name || 'Unknown';
  const sanitizedUserName = userName.toUpperCase().replace(/\s+/g, '');
  const uploadDate = new Date(agreement.uploaded_at);
  const day = String(uploadDate.getDate()).padStart(2, '0');
  const month = String(uploadDate.getMonth() + 1).padStart(2, '0');
  const year = uploadDate.getFullYear();
  const customFilename = `LA_${sanitizedUserName}_${day}${month}${year}.pdf`;

  // Use Cloudinary's fl_attachment transformation for download
  // Handle both /raw/upload/ and /image/upload/ URLs
  let downloadUrl = agreement.pdf_url;
  if (downloadUrl.includes('/raw/upload/')) {
    downloadUrl = downloadUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/');
  } else if (downloadUrl.includes('/image/upload/')) {
    downloadUrl = downloadUrl.replace('/image/upload/', '/image/upload/fl_attachment/');
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="text-gray-900" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">
                {agreement.user_name}
              </h3>
              <p className="text-sm text-gray-600">{agreement.user_email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              Lastet opp:{" "}
              {new Date(agreement.uploaded_at).toLocaleDateString("nb-NO", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {agreement.behandlet && agreement.behandlet_dato && (
            <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg inline-block">
              <strong>Behandlet av {agreement.behandlet_av_name || "Admin"}</strong> •{" "}
              {new Date(agreement.behandlet_dato).toLocaleDateString("nb-NO")}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <a
            href={downloadUrl}
            download={customFilename}
            className="bg-gray-100 text-gray-900 p-2 rounded-lg hover:bg-gray-200 transition-colors"
            title="Last ned PDF"
          >
            <Download size={20} />
          </a>

          <button
            onClick={() => onToggle(agreement.id, agreement.behandlet)}
            disabled={isUpdating}
            className={`p-2 rounded-lg transition-colors ${
              agreement.behandlet
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-green-100 text-green-600 hover:bg-green-200"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={agreement.behandlet ? "Marker som ubehandlet" : "Marker som behandlet"}
          >
            {isUpdating ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : agreement.behandlet ? (
              <X size={20} />
            ) : (
              <Check size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
