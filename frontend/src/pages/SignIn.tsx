import { useNavigate } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { OnboardingCard } from "../components/OnboardingCard";
import { useAuth } from "../lib/auth";

export function SignIn() {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();

  return (
    <div className="flex justify-center pt-10">
      {user ? (
        user.vertical ? (
          <p className="text-[14px] text-muted">
            You're signed in.{" "}
            <button className="font-bold text-forest underline" onClick={() => navigate("/")}>
              Back to the arena
            </button>
          </p>
        ) : (
          <OnboardingCard
            onDone={(updated) => {
              // Token unchanged; refresh the cached user with vertical + role.
              const token = localStorage.getItem("da_token") ?? "";
              signIn(token, updated);
              navigate("/record");
            }}
          />
        )
      ) : (
        <AuthCard
          eyebrow="Sign in"
          title="Judge with your name behind it."
          body="Passwordless — we send a one-time code. Use your work email so your votes carry full weight."
        />
      )}
    </div>
  );
}
