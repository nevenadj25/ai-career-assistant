import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Input } from "../components/Input";
import { Button } from "../components/Button";

import { login } from "../api/authApi";
import { saveToken, saveUser } from "../utils/auth";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Unesite email i lozinku.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await login({
        email,
        password,
      });

      saveToken(response.token);
      saveUser(response.user);

      navigate("/index");
    } catch (error) {
      console.error(error);

      setError("Prijavljivanje nije uspelo. Proverite email i lozinku.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          Dobrodošli nazad
        </h1>

        <p className="mb-8 text-center text-gray-500">
          Prijavite se na svoj AI Career Assistant nalog
        </p>

        <div className="space-y-5">
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

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button type="button" onClick={handleLogin} disabled={loading}>
            {loading ? "Prijavljivanje..." : "Prijavi se"}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Nemate nalog?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            Registrujte se
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
