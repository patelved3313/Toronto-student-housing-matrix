import { useEffect, useRef, useState } from "react";
import AuthCityPanel from "./AuthCityPanel";
import AuthIcon from "./AuthIcon";
import BrandIdentity from "./BrandIdentity";
import StatusMessage from "./StatusMessage";
import "../styles/auth.css";

function AuthField({
  label,
  icon,
  name,
  invalid,
  hint,
  children,
  ...inputProps
}) {
  const id = `auth-${name}`;
  const describedBy = [hint && `${id}-hint`, invalid && "auth-status"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input">
        <AuthIcon name={icon} />
        <input
          {...inputProps}
          id={id}
          name={name}
          required
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy || undefined}
        />
        {children}
      </div>
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}

export default function AuthForm({
  authMode,
  authForm,
  authStatus,
  isSubmitting,
  onFieldChange,
  onModeChange,
  onSubmit,
}) {
  const register = authMode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const pending = useRef(false);
  const formRef = useRef(null);
  const submitLabel = register ? "Create account" : "Sign in";
  const pendingLabel = register ? "Creating account…" : "Signing in…";

  useEffect(() => {
    if (authStatus.field) {
      formRef.current?.elements.namedItem(authStatus.field)?.focus();
    }
  }, [authStatus]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (pending.current || isSubmitting) return;
    pending.current = true;
    try {
      await onSubmit(event);
    } finally {
      pending.current = false;
    }
  };

  const changeMode = (mode) => {
    if (mode === authMode) return;
    setShowPassword(false);
    onModeChange(mode);
  };

  const fieldProps = (name) => ({
    name,
    value: authForm[name],
    invalid: authStatus.field === name,
    disabled: isSubmitting,
    onChange: (event) => onFieldChange(name, event.target.value),
  });

  return (
    <main className="auth-screen">
      <AuthCityPanel />
      <section className="auth-access" aria-labelledby="auth-title">
        <div className="auth-access-inner">
          <BrandIdentity />
          <header className="auth-intro" key={authMode}>
            <h1 id="auth-title">
              {register ? "Create an account." : "Welcome back."}
            </h1>
            <p>
              {register
                ? "Start your student housing search in Toronto."
                : "Sign in to continue your housing search."}
            </p>
          </header>

          <div
            className="auth-modes"
            role="group"
            aria-label="Account options"
            data-mode={authMode}
          >
            <button
              type="button"
              aria-pressed={!register}
              disabled={isSubmitting}
              onClick={() => changeMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              aria-pressed={register}
              disabled={isSubmitting}
              onClick={() => changeMode("register")}
            >
              Create account
            </button>
          </div>

          <form
            className="auth-credentials"
            ref={formRef}
            onSubmit={handleSubmit}
            aria-labelledby="auth-title"
            aria-busy={isSubmitting}
            noValidate
          >
            {register && (
              <AuthField
                {...fieldProps("name")}
                label="Name"
                icon="person"
                type="text"
                autoComplete="name"
                placeholder="Your name"
              />
            )}
            <AuthField
              {...fieldProps("email")}
              label="Email address"
              icon="mail"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@example.com"
            />
            <AuthField
              {...fieldProps("password")}
              label="Password"
              icon="lock"
              type={showPassword ? "text" : "password"}
              minLength={6}
              placeholder={
                register ? "Create a password" : "Enter your password"
              }
              hint={register ? "Use at least 6 characters." : undefined}
              autoComplete={register ? "new-password" : "current-password"}
            >
              <button
                className="auth-reveal"
                type="button"
                disabled={isSubmitting}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-controls="auth-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <AuthIcon name={showPassword ? "eyeOff" : "eye"} />
              </button>
            </AuthField>

            {authStatus.message && (
              <StatusMessage id="auth-status" type={authStatus.type || "info"}>
                {authStatus.message}
              </StatusMessage>
            )}
            <button
              type="submit"
              className="auth-action"
              disabled={isSubmitting}
            >
              {isSubmitting ? pendingLabel : submitLabel}
              {isSubmitting ? (
                <span className="auth-spinner" aria-hidden="true" />
              ) : (
                <AuthIcon name="arrow" />
              )}
            </button>
          </form>
          <span className="visually-hidden" role="status">
            {isSubmitting ? pendingLabel : ""}
          </span>
        </div>
      </section>
    </main>
  );
}
