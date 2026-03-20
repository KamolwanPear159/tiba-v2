export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-[80px]"
      style={{ background: 'linear-gradient(1.37deg, #1f4488 2.37%, #6f8aba 97.82%)' }}
    >
      {children}
    </div>
  )
}
