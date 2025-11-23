import RegisterForm from '@/components/auth/RegisterForm'; // Pas pad aan indien nodig

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <RegisterForm />
      </div>
    </div>
  );
}