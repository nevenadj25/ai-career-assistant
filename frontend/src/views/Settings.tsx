import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

import { putRequest, deleteRequest } from "../api/ApiFunctions";

const Settings = () => {
  const navigate = useNavigate();

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [changingPassword, setChangingPassword] = useState(false);

  // =========================================================
  // DELETE ACCOUNT
  // =========================================================

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [deleteError, setDeleteError] = useState("");

  const [deletingAccount, setDeletingAccount] = useState(false);

  // =========================================================
  // CLOSE PASSWORD MODAL
  // =========================================================

  const closePasswordModal = () => {
    setShowPasswordModal(false);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setPasswordError("");
    setPasswordSuccess("");
  };

  // =========================================================
  // CLOSE DELETE MODAL
  // =========================================================

  const closeDeleteModal = () => {
    setShowDeleteModal(false);

    setDeleteConfirmation("");
    setDeleteError("");
  };

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Popunite sva polja.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Nova lozinka mora imati najmanje 6 karaktera.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Nova lozinka i potvrda lozinke se ne poklapaju.");

      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("Nova lozinka mora biti različita od trenutne lozinke.");

      return;
    }

    try {
      setChangingPassword(true);

      await putRequest<
        {
          message: string;
        },
        {
          currentPassword: string;
          newPassword: string;
        }
      >("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess("Lozinka je uspešno promenjena.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordError(
        error?.message || "Došlo je do greške prilikom promene lozinke.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // =========================================================
  // DELETE ACCOUNT
  // =========================================================

  const handleDeleteAccount = async () => {
    setDeleteError("");

    if (deleteConfirmation !== "OBRIŠI") {
      setDeleteError('Unesite reč "OBRIŠI" kako biste potvrdili brisanje.');

      return;
    }

    try {
      setDeletingAccount(true);

      await deleteRequest("/auth/account");

      /*
        Brišemo sve lokalne podatke vezane za prijavljenog korisnika.
      */

      localStorage.clear();

      /*
        Nakon brisanja naloga korisnik više ne treba da ostane
        u aplikaciji.
      */

      navigate("/login");
    } catch (error: any) {
      setDeleteError(
        error?.message || "Došlo je do greške prilikom brisanja naloga.",
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          {/* PAGE HEADER */}

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800">
              Podešavanja ⚙️
            </h1>

            <p className="mt-2 text-gray-600">
              Upravljajte svojim profilom i bezbednošću naloga.
            </p>
          </div>

          {/* ACCOUNT */}

          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Nalog 👤</h2>

              <p className="mt-1 text-sm text-gray-500">
                Pregledajte podatke profila i upravljajte svojim nalogom.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {/* PROFILE */}

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="group rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                  👤
                </div>

                <h3 className="text-lg font-bold text-gray-800 transition group-hover:text-indigo-600">
                  Moj profil
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Pregledajte i izmenite svoje lične podatke.
                </p>

                <p className="mt-5 text-sm font-semibold text-indigo-600">
                  Otvori profil →
                </p>
              </button>

              {/* CHANGE PASSWORD */}

              <button
                type="button"
                onClick={() => {
                  setPasswordError("");
                  setPasswordSuccess("");

                  setShowPasswordModal(true);
                }}
                className="group rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                  🔒
                </div>

                <h3 className="text-lg font-bold text-gray-800 transition group-hover:text-indigo-600">
                  Promeni lozinku
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Promenite lozinku koju koristite za prijavu na svoj nalog.
                </p>

                <p className="mt-5 text-sm font-semibold text-indigo-600">
                  Promeni lozinku →
                </p>
              </button>

              {/* DELETE ACCOUNT */}

              <button
                type="button"
                onClick={() => {
                  setDeleteError("");
                  setDeleteConfirmation("");

                  setShowDeleteModal(true);
                }}
                className="group rounded-2xl border border-red-200 bg-red-50 p-6 text-left transition duration-200 hover:-translate-y-1 hover:border-red-300 hover:bg-red-100 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-2xl">
                  🗑️
                </div>

                <h3 className="text-lg font-bold text-red-600">Obriši nalog</h3>

                <p className="mt-2 text-sm leading-6 text-red-400">
                  Trajno obrišite svoj nalog i podatke povezane sa njim.
                </p>

                <p className="mt-5 text-sm font-semibold text-red-600">
                  Obriši nalog →
                </p>
              </button>
            </div>
          </section>

          {/* SECURITY */}

          <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
            <div className="flex gap-3">
              <span className="text-xl">🔐</span>

              <div>
                <p className="font-semibold text-slate-800">
                  Bezbednost naloga
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Koristite jaku lozinku i nemojte je koristiti na drugim
                  servisima.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* =========================================================
          CHANGE PASSWORD MODAL
      ========================================================= */}

      {showPasswordModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                  🔒
                </div>

                <h2 className="text-2xl font-bold text-slate-800">
                  Promena lozinke
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Unesite trenutnu i novu lozinku.
                </p>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* CURRENT PASSWORD */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Trenutna lozinka
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Unesite trenutnu lozinku"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* NEW PASSWORD */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nova lozinka
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Unesite novu lozinku"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* CONFIRM PASSWORD */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Potvrdi novu lozinku
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ponovite novu lozinku"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* ERROR */}

              {passwordError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {passwordError}
                </div>
              )}

              {/* SUCCESS */}

              {passwordSuccess && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  ✓ {passwordSuccess}
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                  className="rounded-xl border border-gray-200 px-5 py-3 font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Otkaži
                </button>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword ? "Čuvanje..." : "Promeni lozinku"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          DELETE ACCOUNT MODAL
      ========================================================= */}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-2xl">
                ⚠️
              </div>

              <button
                type="button"
                onClick={closeDeleteModal}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <h2 className="text-2xl font-bold text-slate-800">Obriši nalog</h2>

            <p className="mt-3 leading-6 text-gray-600">
              Da li ste sigurni da želite da obrišete svoj nalog?
            </p>

            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm leading-6 text-red-700">
                Ova radnja je trajna. Biće obrisani podaci povezani sa vašim
                nalogom, uključujući sačuvane CV-jeve, motivaciona pisma i
                ostale podatke aplikacije.
              </p>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Za potvrdu unesite{" "}
                <span className="font-bold text-red-600">OBRIŠI</span>
              </label>

              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="OBRIŠI"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            {deleteError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletingAccount}
                className="rounded-xl border border-gray-200 px-5 py-3 font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Otkaži
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirmation !== "OBRIŠI"}
                className="rounded-xl bg-red-600 px-5 py-3 font-medium text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingAccount ? "Brisanje..." : "Obriši nalog"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
