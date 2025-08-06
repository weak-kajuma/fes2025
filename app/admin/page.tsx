import { signIn, auth, signOut } from "@/auth";

export default async function AdminPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {session ? (
            <div className="text-center">
              <div className="mb-4">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-16 h-16 rounded-full mx-auto mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome, {session.user?.name}!
                </h2>
                <p className="text-gray-600 mb-6">
                  You are successfully logged in to the admin panel.
                </p>
              </div>

              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Admin Login
              </h2>
              <p className="text-gray-600 mb-6">
                Please sign in with your Google account to access the admin panel.
              </p>

              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
