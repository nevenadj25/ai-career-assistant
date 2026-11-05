import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Input } from "../components/Input";
import { Button } from "../components/Button";

import { register } from "../api/authApi";
import { saveToken, saveUser } from "../utils/auth";

const Register = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Popunite sva polja.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Lozinke se ne podudaraju.");
      return;
    }

    if (password.length < 6) {
      setError("Lozinka mora imati najmanje 6 karaktera.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await register({
        firstName,
        lastName,
        email,
        password,
      });

      saveToken(response.token);
      saveUser(response.user);

      navigate("/index");
    } catch (error) {
      console.error(error);

      setError("Registracija nije uspela. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-200 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          Kreirajte nalog
        </h1>

        <p className="mb-8 text-center text-gray-500">
          Započnite svoje AI Career Assistant iskustvo
        </p>

        <div className="space-y-5">
          <Input
            label="Ime"
            placeholder="Unesite ime"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <Input
            label="Prezime"
            placeholder="Unesite prezime"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <Input
            label="Email"
            placeholder="Unesite email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Lozinka"
            placeholder="Unesite lozinku"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Potvrdite lozinku"
            placeholder="Ponovite lozinku"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button type="button" onClick={handleRegister} disabled={loading}>
            {loading ? "Kreiranje naloga..." : "Registruj se"}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Već imate nalog?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            Prijavite se
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
