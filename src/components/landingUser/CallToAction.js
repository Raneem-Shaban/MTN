import Button from '../common/buttons/Button'

const CallToAction = () => {
  return (
    <section className="bg-[var(--color-secondary)] text-[var(--color-white)] py-20 px-4 md:px-6 lg:px-8 text-center">
      <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
      <p className="mb-6 max-w-2xl mx-auto">
        Join the Training Tracking System and benefit from all available features to improve communication and training processes
      </p>
      <Button variant="primary" >Get Started Now</Button>
    </section>
  );
};

export default CallToAction;
