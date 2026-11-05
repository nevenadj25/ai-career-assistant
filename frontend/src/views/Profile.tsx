import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

import { getRequest, putRequest } from "../api/ApiFunctions";

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

interface UpdateProfileResponse {
  message: string;
  profile: ProfileData;
}

const emptyProfile: ProfileData = {
  id: 0,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  jobTitle: "",
  profilePhoto: "",
};

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);

  const [editData, setEditData] = useState<ProfileData>(emptyProfile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getRequest<ProfileData>("/profile");

      setProfile(data);
      setEditData(data);
    } catch (error: any) {
      setError(error?.message || "Greška prilikom učitavanja profila.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /* =========================================================
     INITIALS
  ========================================================= */

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  /* =========================================================
     OPEN / CLOSE MODAL
  ========================================================= */

  const openEditModal = () => {
    setEditData(profile);
    setError("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (saving) {
      return;
    }

    setEditData(profile);
    setError("");
    setShowEditModal(false);
  };

  /* =========================================================
     PHOTO UPLOAD
  ========================================================= */

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Dozvoljeni formati slike su JPG, PNG i WEBP.");

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Profilna slika ne sme biti veća od 2 MB.");

      return;
    }

    setError("");

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 500;

        let width = image.width;
        let height = image.height;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);

          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);

          height = maxSize;
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          setError("Slika nije mogla da bude obrađena.");

          return;
        }

        context.drawImage(image, 0, 0, width, height);

        const compressedPhoto = canvas.toDataURL("image/jpeg", 0.8);

        setEditData((previous) => ({
          ...previous,
          profilePhoto: compressedPhoto,
        }));
      };

      image.src = reader.result as string;
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  /* =========================================================
     REMOVE PHOTO
  ========================================================= */

  const removePhoto = () => {
    setEditData((previous) => ({
      ...previous,
      profilePhoto: "",
    }));
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setSavedMessage("");

    if (!editData.firstName.trim() || !editData.lastName.trim()) {
      setError("Ime i prezime su obavezni.");

      return;
    }

    try {
      setSaving(true);

      const response = await putRequest<
        UpdateProfileResponse,
        {
          firstName: string;
          lastName: string;
          phone: string;
          location: string;
          linkedin: string;
          jobTitle: string;
          profilePhoto: string;
        }
      >("/profile", {
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phone,
        location: editData.location,
        linkedin: editData.linkedin,
        jobTitle: editData.jobTitle,
        profilePhoto: editData.profilePhoto,
      });

      setProfile(response.profile);
      setEditData(response.profile);

      setShowEditModal(false);

      setSavedMessage("Profil je uspešno sačuvan.");

      /*
       * Kažemo Header-u da je profil promenjen.
       *
       * Tako će odmah učitati novu sliku i ime,
       * bez refresh-a stranice.
       */

      window.dispatchEvent(new Event("profileUpdated"));

      window.setTimeout(() => {
        setSavedMessage("");
      }, 3000);
    } catch (error: any) {
      setError(error?.message || "Greška prilikom čuvanja profila.");
    } finally {
      setSaving(false);
    }
  };

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

              <p className="mt-4 text-gray-500">Učitavanje profila...</p>
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

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          {/* HEADER */}

          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Moj profil 👤
              </h1>

              <p className="mt-2 text-gray-600">
                Upravljajte svojim profilom i ličnim podacima.
              </p>
            </div>

            {savedMessage && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                ✓ {savedMessage}
              </div>
            )}
          </div>

          {error && !showEditModal && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* PROFILE CARD */}

            <section className="rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex flex-col items-center text-center">
                {profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt="Profilna slika"
                    className="h-28 w-28 rounded-full object-cover shadow-lg ring-4 ring-indigo-50"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl font-bold text-white shadow-lg">
                    {getInitials(profile.firstName, profile.lastName) || "U"}
                  </div>
                )}

                <h2 className="mt-5 text-2xl font-bold text-slate-800">
                  {profile.firstName} {profile.lastName}
                </h2>

                <p className="mt-1 text-gray-500">
                  {profile.jobTitle || "Pozicija nije uneta"}
                </p>

                <button
                  type="button"
                  onClick={openEditModal}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700"
                >
                  Izmeni profil
                </button>
              </div>
            </section>

            {/* PERSONAL INFO */}

            <section className="rounded-2xl bg-white p-6 shadow-xl lg:col-span-2">
              <h2 className="mb-6 text-2xl font-bold text-slate-800">
                Lični podaci
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Ime</p>

                  <p className="mt-1 font-medium text-gray-800">
                    {profile.firstName || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Prezime</p>

                  <p className="mt-1 font-medium text-gray-800">
                    {profile.lastName || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>

                  <p className="mt-1 break-all font-medium text-gray-800">
                    {profile.email || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Telefon</p>

                  <p className="mt-1 font-medium text-gray-800">
                    {profile.phone || "Nije unet"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Lokacija</p>

                  <p className="mt-1 font-medium text-gray-800">
                    {profile.location || "Nije uneta"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Pozicija</p>

                  <p className="mt-1 font-medium text-gray-800">
                    {profile.jobTitle || "Nije uneta"}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">LinkedIn</p>

                  {profile.linkedin ? (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block break-all font-medium text-indigo-600 hover:underline"
                    >
                      {profile.linkedin}
                    </a>
                  ) : (
                    <p className="mt-1 font-medium text-gray-800">Nije unet</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>

      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      {showEditModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-7 shadow-2xl">
            {/* MODAL HEADER */}

            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Izmeni profil
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Izmenite podatke koji se prikazuju na vašem profilu.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              {/* PHOTO */}

              <div className="mb-7 flex flex-col items-center">
                {editData.profilePhoto ? (
                  <img
                    src={editData.profilePhoto}
                    alt="Profilna slika"
                    className="h-28 w-28 rounded-full object-cover shadow-lg ring-4 ring-indigo-50"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl font-bold text-white shadow-lg">
                    {getInitials(editData.firstName, editData.lastName) || "U"}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <label className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
                    {editData.profilePhoto ? "Promeni sliku" : "Dodaj sliku"}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {editData.profilePhoto && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Ukloni sliku
                    </button>
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  JPG, PNG ili WEBP, maksimalno 2 MB.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* INPUTS */}

              <div className="grid gap-5 md:grid-cols-2">
                {/* FIRST NAME */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Ime
                  </label>

                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(event) =>
                      setEditData((previous) => ({
                        ...previous,
                        firstName: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* LAST NAME */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Prezime
                  </label>

                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(event) =>
                      setEditData((previous) => ({
                        ...previous,
                        lastName: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={editData.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Email se ne menja preko profila.
                  </p>
                </div>

                {/* PHONE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Telefon
                  </label>

                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(event) =>
                      setEditData((previous) => ({
                        ...previous,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="+381 60..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* LOCATION */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Lokacija
                  </label>

                  <input
                    type="text"
                    value={editData.location}
                    onChange={(event) =>
                      setEditData((previous) => ({
                        ...previous,
                        location: event.target.value,
                      }))
                    }
                    placeholder="Beograd, Srbija"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* JOB TITLE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Pozicija
                  </label>

                  <input
                    type="text"
                    value={editData.jobTitle}
                    onChange={(event) =>
                      setEditData((previous) => ({
                        ...previous,
                        jobTitle: event.target.value,
                      }))
                    }
                    placeholder="Frontend Developer"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* LINKEDIN */}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    LinkedIn
                  </label>

                  <input
                    type="url"
                    value={editData.linkedin}
                    onChange={(event) =>
                      setEditData((previous) => ({
                        ...previous,
                        linkedin: event.target.value,
                      }))
                    }
                    placeholder="https://www.linkedin.com/in/..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* BUTTONS */}

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Otkaži
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Čuvanje..." : "Sačuvaj izmene"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
