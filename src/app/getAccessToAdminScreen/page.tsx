import SignInForm from "./SignInForm";

export default function SecretAdminLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </main>
  );
}
