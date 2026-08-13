import SignInForm from "./SignInForm";

export default function SecretAdminLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Admin Access
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Strictly authorized personnel only.
          </p>
        </div>
        
        <SignInForm />
      </div>
    </div>
  );
}