// src/components/landing/LandingHeader.js
import Container from '../layout/Container'

const LandingHeader = () => {
  return (
    <header className="w-full bg-[var(--color-bg)] shadow">
      {/* المحتوى المتمركز */}
      <Container className="flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <img src="/assets/img/mtn-logo.svg" alt="Logo" className="h-8" />
          <span className="font-semibold text-md">Training Tracking System</span>
        </div>
        <nav className="space-x-4 text-sm">
          <a href="/home" className="hover:underline">Home</a>
          <a href="/login" className="hover:underline">Login</a>
        </nav>
      </Container>
    </header>
  );
};
export default LandingHeader;
