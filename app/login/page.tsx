import LoginForm from '@/components/auth/LoginForm'; // Pas pad aan indien nodig

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <LoginForm />
      </div>
    </div>
  );
}