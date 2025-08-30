import Container from '../layout/Container'

const LandingHeader = () => {
  return (
    <header className="w-full bg-[var(--color-bg)] shadow">
      <Container className="flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <img src="/assets/img/mtn-logo.svg" alt="Logo" className="h-8" />
          <span className="font-semibold text-md">TrainTrack</span>
        </div>

      </Container>
    </header>
  );
};
export default LandingHeader;
