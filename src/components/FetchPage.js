import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import "./FetchPage.css";

function FetchPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { credentials, logout: authLogout } = useContext(AuthContext);

  // Listen to browser back button
  useEffect(() => {
    const handleBackButton = () => {
      localStorage.removeItem("appData");
      authLogout();
      navigate("/login", { replace: true });
    };

    window.addEventListener('popstate', handleBackButton);
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [authLogout, navigate]);

  // Trigger form submit on Enter key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const fetchButton = document.getElementById("fetch-button");
        if (fetchButton && !loading) {
          fetchButton.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!credentials?.username || !credentials?.password) {
      setError("Missing credentials");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://192.168.100.113:8081/api/get-full-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          userpassword: credentials.password,
          Menuid: "01",
          nooftables: "3",
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch data");
      }

      localStorage.setItem("appData", JSON.stringify({
        company: result.data.company,
        branches: result.data.branches,
        menu: result.data.menu,
        credentials: credentials,
      }));

      navigate("/dashboard");
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fetch-wrapper">
      <div className="fetch-box">
        <div className="fetch-left">
          <h2>Welcome</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <p className="fetch-desc">Click below to load your menu and continue.</p>
            <button id="fetch-button" type="submit" disabled={loading}>
              {loading ? "Fetching..." : "Fetch Menu & Go 🚀"}
            </button>
          </form>
        </div>
        <div className="fetch-right">
          <img
            src="https://smartsols.org/wp-content/uploads/2023/11/cropped-Smart-Solution-Logo-2-120x91.png"
            alt="Company"
            className="fetch-illustration"
          />
        </div>
      </div>
    </div>
  );
}

export default FetchPage;
