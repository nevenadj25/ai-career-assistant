import { useEffect, useMemo, useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import DashboardCard from "../components/DashboardCard";
import QuickActions from "../components/QuickActions";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

import { getRequest } from "../api/ApiFunctions";

interface ProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  jobTitle: string;
  profilePhoto: string;
}

interface DashboardCV {
  id: number;

  title?: string;
  name?: string;

  created_at?: string;
  updated_at?: string;

  createdAt?: string;
  updatedAt?: string;
}

interface CoverLetter {
  id: number;

  position?: string;
  company?: string;

  created_at?: string;
  updated_at?: string;

  createdAt?: string;
  updatedAt?: string;
}

interface ActivityItem {
  id: string;
  type: "cv" | "cover-letter";

  title: string;
  description: string;

  date: Date;
}

const getDateValue = (item: DashboardCV | CoverLetter): string | undefined => {
  return item.updated_at || item.updatedAt || item.created_at || item.createdAt;
};

const formatActivityDate = (date: Date) => {
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const activityDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const difference = today.getTime() - activityDay.getTime();

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return "Danas";
  }

  if (days === 1) {
    return "Juče";
  }

  if (days > 1 && days < 7) {
    return `Pre ${days} dana`;
  }

  return date.toLocaleDateString("sr-RS");
};

const Dashboard = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [cvs, setCvs] = useState<DashboardCV[]>([]);

  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const results = await Promise.allSettled([
        getRequest<ProfileData>("/profile"),

        getRequest<
          | DashboardCV[]
          | {
              cvs: DashboardCV[];
            }
        >("/cvs"),

        getRequest<
          | CoverLetter[]
          | {
              coverLetters: CoverLetter[];
            }
        >("/cover-letters"),
      ]);

      const profileResult = results[0];

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      }
      const cvResult = results[1];

      if (cvResult.status === "fulfilled") {
        const response = cvResult.value;

        if (Array.isArray(response)) {
          setCvs(response);
        } else {
          setCvs(response.cvs || []);
        }
      }

      const coverLetterResult = results[2];

      if (coverLetterResult.status === "fulfilled") {
        const response = coverLetterResult.value;

        if (Array.isArray(response)) {
          setCoverLetters(response);
        } else {
          setCoverLetters(response.coverLetters || []);
        }
      }

      if (
        profileResult.status === "rejected" &&
        cvResult.status === "rejected"
      ) {
        setError(
          "Podaci sa početne stranice trenutno nisu mogli da se učitaju.",
        );
      }
    } catch (error) {
      console.error("Dashboard load error:", error);

      setError("Greška prilikom učitavanja početne stranice.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);
  const profileCompletion = useMemo(() => {
    if (!profile) {
      return 0;
    }

    const fields = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.phone,
      profile.location,
      profile.linkedin,
      profile.jobTitle,
      profile.profilePhoto,
    ];

    const completedFields = fields.filter(
      (field) => typeof field === "string" && field.trim() !== "",
    ).length;

    return Math.round((completedFields / fields.length) * 100);
  }, [profile]);

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const activities: ActivityItem[] = [];

    /* CVS */

    cvs.forEach((cv) => {
      const dateValue = getDateValue(cv);

      if (!dateValue) {
        return;
      }

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      activities.push({
        id: `cv-${cv.id}`,
        type: "cv",

        title: cv.title || cv.name || "CV",

        description: "CV je sačuvan",

        date,
      });
    });

    coverLetters.forEach((letter) => {
      const dateValue = getDateValue(letter);

      if (!dateValue) {
        return;
      }

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const titleParts = [letter.position, letter.company].filter(Boolean);

      activities.push({
        id: `cover-letter-${letter.id}`,
        type: "cover-letter",

        title:
          titleParts.length > 0 ? titleParts.join(" – ") : "Motivaciono pismo",

        description: "Motivaciono pismo je sačuvano",

        date,
      });
    });

    return activities
      .sort((first, second) => second.date.getTime() - first.date.getTime())
      .slice(0, 5);
  }, [cvs, coverLetters]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Sidebar />

        <div className="flex flex-1 flex-col">
          <Header />

          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

              <p className="mt-4 text-gray-500">
                Učitavanje početne stranice...
              </p>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-8">
          <Hero />
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-800">
                Pregled aktivnosti
              </h2>

              <p className="mt-1 text-gray-500">
                Pregled vaših sačuvanih podataka i aktivnosti.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <DashboardCard
                icon="📄"
                title="Moji CV-jevi"
                value={String(cvs.length)}
                description={
                  cvs.length === 1 ? "Sačuvan CV" : "Sačuvanih CV-jeva"
                }
              />

              {/* COVER LETTERS */}

              <DashboardCard
                icon="✉️"
                title="Motivaciona pisma"
                value={String(coverLetters.length)}
                description={
                  coverLetters.length === 1
                    ? "Sačuvano motivaciono pismo"
                    : "Sačuvanih motivacionih pisama"
                }
              />

              {/* PROFILE */}

              <DashboardCard
                icon="👤"
                title="Popunjenost profila"
                value={`${profileCompletion}%`}
                description={
                  profileCompletion === 100
                    ? "Profil je kompletiran"
                    : "Dopunite podatke na profilu"
                }
              />
            </div>
          </section>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <QuickActions />

          {/* =================================================
              CAREER PROGRESS
          ================================================= */}

          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Career Progress
              </h2>

              <p className="mt-1 text-gray-500">
                Pregled vašeg napretka u aplikaciji.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* CVS */}

              <div className="rounded-xl bg-indigo-50 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                  📄
                </div>

                <p className="font-semibold text-gray-700">CV-jevi</p>

                <p className="mt-2 text-3xl font-bold text-indigo-600">
                  {cvs.length}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  {cvs.length === 0
                    ? "Kreirajte svoj prvi CV."
                    : cvs.length === 1
                      ? "Imate jedan sačuvan CV."
                      : `Imate ${cvs.length} sačuvanih CV-jeva.`}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
                  ✉️
                </div>

                <p className="font-semibold text-gray-700">Motivaciona pisma</p>

                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {coverLetters.length}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  {coverLetters.length === 0
                    ? "Još nemate sačuvano motivaciono pismo."
                    : coverLetters.length === 1
                      ? "Imate jedno sačuvano motivaciono pismo."
                      : `Imate ${coverLetters.length} sačuvanih motivacionih pisama.`}
                </p>
              </div>

              {/* PROFILE */}

              <div className="rounded-xl bg-blue-50 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                    👤
                  </div>

                  <span className="font-bold text-blue-600">
                    {profileCompletion}%
                  </span>
                </div>

                <p className="font-semibold text-gray-700">Profil</p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{
                      width: `${profileCompletion}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-sm text-gray-500">
                  {profileCompletion === 100
                    ? "Profil je potpuno popunjen."
                    : "Dopunite profil kako bi bio kompletan."}
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              RECENT ACTIVITY
          ================================================= */}

          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Nedavna aktivnost
              </h2>

              <p className="mt-1 text-gray-500">
                Vaše poslednje sačuvane aktivnosti.
              </p>
            </div>

            {recentActivity.length === 0 ? (
              /* EMPTY STATE */

              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                <div className="text-4xl">📭</div>

                <h3 className="mt-4 font-semibold text-gray-700">
                  Još nema aktivnosti
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Kada kreirate CV ili sačuvate motivaciono pismo, aktivnosti će
                  biti prikazane ovde.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 transition hover:bg-gray-100"
                  >
                    {/* ICON */}

                    <div
                      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-xl ${
                        activity.type === "cv"
                          ? "bg-indigo-100"
                          : "bg-purple-100"
                      }`}
                    >
                      {activity.type === "cv" ? "📄" : "✉️"}
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-800">
                        {activity.title}
                      </p>

                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                    </div>

                    {/* DATE */}

                    <span className="flex-shrink-0 text-sm text-gray-400">
                      {formatActivityDate(activity.date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
