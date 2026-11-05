import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, test } from "node:test";
import React from "react";
import { createFrontendTestServer, installDom } from "./helpers/domHarness.js";

let restoreDom, server, App, MemoryRouter;
let cleanup, fireEvent, render, screen, within, userEvent;
let requests;
const originalFetch = globalThis.fetch;
const student = { name: "Sam", email: "sam@example.test" };
const password = " space! ";
const tokenKey = "tshm_auth_token";
const userKey = "tshm_auth_user";

before(async () => {
  restoreDom = installDom();
  server = await createFrontendTestServer({ stubListingsMap: true });
  ({ default: App } = await server.ssrLoadModule("/src/App.jsx"));
  ({ MemoryRouter } = await import("react-router-dom"));
  ({ cleanup, fireEvent, render, screen, within } = await import(
    "@testing-library/react"
  ));
  ({ default: userEvent } = await import("@testing-library/user-event"));
});

beforeEach(() => {
  localStorage.clear();
  requests = [];
  mockApi();
});

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
});

after(async () => {
  await server?.close();
  restoreDom?.();
});

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status });

function mockApi(authResponse) {
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    requests.push({ path, ...options });
    if (path.startsWith("/api/auth/")) return authResponse(path);
    return json({ listings: [], searches: [], campuses: [] });
  };
}

function openApp(path = "/") {
  render(
    React.createElement(
      MemoryRouter,
      { initialEntries: [path] },
      React.createElement(App),
    ),
  );
  return userEvent.setup({ document });
}

const form = () => screen.getByRole("form");
const submit = () =>
  within(form()).getByRole("button", { name: /^(Sign in|Create account)$/ });
const modes = () =>
  within(screen.getByRole("group", { name: "Account options" }));
const emailInput = () => screen.getByLabelText("Email address");
const passwordInput = () => screen.getByLabelText("Password", { exact: true });

test("both modes expose labeled native inputs and retain edits across switches without submitting", async () => {
  const user = openApp();
  assert.ok(screen.getByRole("heading", { name: "Welcome back." }));
  assert.equal(screen.queryByLabelText("Name"), null);
  assert.equal(emailInput().type, "email");
  assert.equal(emailInput().autocomplete, "email");
  assert.equal(passwordInput().autocomplete, "current-password");
  assert.equal(passwordInput().minLength, 6);
  assert.equal(
    modes()
      .getByRole("button", { name: "Sign in" })
      .getAttribute("aria-pressed"),
    "true",
  );

  await user.type(emailInput(), student.email);
  await user.type(passwordInput(), password);
  await user.click(modes().getByRole("button", { name: "Create account" }));
  assert.ok(screen.getByRole("heading", { name: "Create an account." }));
  assert.equal(screen.getByLabelText("Name").autocomplete, "name");
  assert.equal(passwordInput().autocomplete, "new-password");
  await user.type(screen.getByLabelText("Name"), student.name);
  await user.click(modes().getByRole("button", { name: "Sign in" }));
  await user.click(modes().getByRole("button", { name: "Create account" }));
  assert.equal(emailInput().value, student.email);
  assert.equal(passwordInput().value, password);
  assert.equal(screen.getByLabelText("Name").value, student.name);
  assert.equal(requests.length, 0);
});

test("the keyboard reveal control keeps the same input and value, and switching modes masks it", async () => {
  const user = openApp();
  await user.type(passwordInput(), password);
  const input = passwordInput();
  await user.tab();
  assert.equal(
    document.activeElement,
    screen.getByRole("button", { name: "Show password" }),
  );
  await user.keyboard("{Enter}");
  assert.equal(input.type, "text");
  assert.equal(input, passwordInput());
  assert.equal(input.value, password);
  assert.equal(
    document.activeElement,
    screen.getByRole("button", { name: "Hide password" }),
  );
  await user.keyboard(" ");
  assert.equal(input.type, "password");
  await user.keyboard(" ");
  await user.click(modes().getByRole("button", { name: "Create account" }));
  assert.equal(passwordInput().type, "password");
  assert.equal(passwordInput().value, password);
  assert.equal(requests.length, 0);
});

test("existing validation messages focus and describe the failing field and clear on edits or mode changes", async () => {
  const user = openApp();
  const checkError = async (message, input) => {
    await user.click(submit());
    assert.equal(screen.getByRole("alert").textContent, message);
    assert.equal(document.activeElement, input);
    assert.equal(input.getAttribute("aria-invalid"), "true");
    assert.ok(
      input.getAttribute("aria-describedby").split(" ").includes("auth-status"),
    );
  };
  await checkError("Email and password are required.", emailInput());
  await user.type(emailInput(), "invalid");
  assert.equal(screen.queryByRole("alert"), null);
  await checkError("Email and password are required.", passwordInput());
  await user.type(passwordInput(), "123");
  await checkError("Please enter a valid email address.", emailInput());
  await user.clear(emailInput());
  await user.type(emailInput(), student.email);
  await checkError(
    "Password must be at least 6 characters long.",
    passwordInput(),
  );
  await user.click(modes().getByRole("button", { name: "Create account" }));
  assert.equal(screen.queryByRole("alert"), null);
  await checkError("Name is required.", screen.getByLabelText("Name"));
  assert.equal(requests.length, 0);
});

for (const mode of ["login", "register"]) {
  test(`${mode} submits the existing JSON contract once, persists the session and resumes the intended page`, async () => {
    const response = Promise.withResolvers();
    mockApi(() => response.promise);
    const user = openApp("/saved");
    if (mode === "register") {
      await user.click(modes().getByRole("button", { name: "Create account" }));
      await user.type(screen.getByLabelText("Name"), "  Sam  ");
    }
    await user.type(emailInput(), "SAM@EXAMPLE.TEST");
    await user.type(passwordInput(), password);
    await user.keyboard("{Enter}");
    const pendingLabel = mode === "login" ? "Signing in…" : "Creating account…";
    assert.ok(screen.getByRole("button", { name: pendingLabel }).disabled);
    assert.ok(modes().getByRole("button", { name: "Create account" }).disabled);
    assert.equal(form().getAttribute("aria-busy"), "true");
    assert.equal(screen.getByRole("status").textContent, pendingLabel);
    fireEvent.submit(form());
    assert.equal(requests.length, 1);
    const [request] = requests;
    assert.equal(request.path, `/api/auth/${mode}`);
    assert.equal(request.method, "POST");
    assert.deepEqual(request.headers, { "Content-Type": "application/json" });
    const expected = { email: student.email, password };
    if (mode === "register") expected.name = student.name;
    assert.deepEqual(JSON.parse(request.body), expected);

    response.resolve(json({ user: student, token: "test-session" }));
    await screen.findByRole("heading", { name: "Saved Listings" });
    assert.equal(localStorage.getItem(tokenKey), "test-session");
    assert.deepEqual(JSON.parse(localStorage.getItem(userKey)), student);
    assert.ok(
      screen.getByText(
        mode === "login"
          ? "Login successful."
          : "Registration successful. You are logged in.",
      ),
    );
    assert.ok(
      requests.some(
        (req) =>
          req.path === "/api/saved-listings" &&
          req.headers.Authorization === "Bearer test-session",
      ),
    );
  });
}

test("rejected requests show the existing server failure copy and allow retry", async () => {
  let status = 401;
  mockApi(() => json({ message: "Rejected" }, status));
  const user = openApp();
  await user.type(emailInput(), student.email);
  await user.type(passwordInput(), password);
  await user.click(submit());
  assert.equal(
    (await screen.findByRole("alert")).textContent,
    "Your email or password was not accepted. Please try again.",
  );
  status = 503;
  await user.click(submit());
  assert.equal(
    (await screen.findByRole("alert")).textContent,
    "We couldn’t log you in. Please try again.",
  );
  assert.equal(passwordInput().value, password);
  await user.click(modes().getByRole("button", { name: "Create account" }));
  await user.type(screen.getByLabelText("Name"), student.name);
  await user.click(submit());
  assert.equal(
    (await screen.findByRole("alert")).textContent,
    "We couldn’t create your account. Please try again.",
  );
  assert.equal(localStorage.getItem(tokenKey), null);
});

test("an expired stored session returns to the form with its original alert", async () => {
  localStorage.setItem(tokenKey, "expired-token");
  localStorage.setItem(userKey, JSON.stringify(student));
  const response = Promise.withResolvers();
  mockApi(() => response.promise);
  openApp("/saved");
  assert.ok(screen.getByRole("heading", { name: "Checking your account" }));
  response.resolve(json({}, 401));
  assert.equal(
    (await screen.findByRole("alert")).textContent,
    "Your saved login expired. Please log in again.",
  );
  assert.equal(requests[0].path, "/api/auth/me");
  assert.equal(requests[0].headers.Authorization, "Bearer expired-token");
  assert.equal(localStorage.getItem(tokenKey), null);
  assert.equal(localStorage.getItem(userKey), null);
});

test("public results remain accessible without the authentication form", async () => {
  await React.act(async () => {
    openApp("/results");
  });
  assert.equal(screen.queryByRole("heading", { name: "Welcome back." }), null);
  assert.ok(
    await screen.findByRole("heading", { name: "Listings and locations" }),
  );
});
