import LandingHeader from '../../components/landingUser/LandingHeader';
import HeroSection from '../../components/landingUser/HeroSection';
import FeaturesSection from '../../components/landingUser/FeaturesSection';
import InfoBar from '../../components/landingUser/InfoBar';
import HowItWorksSection from '../../components/landingUser/HowItWorksSection';
import UsefulLinksSection from '../../components/landingUser/UsefulLinksSection';
import CallToAction from '../../components/landingUser/CallToAction';
import LandingFooter from '../../components/landingUser/LandingFooter';

const UserLandingPage = () => {
  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-text-main)] font-sans">
      <LandingHeader />
      <HeroSection /> 
      <FeaturesSection />
      <InfoBar />
      <HowItWorksSection />
      <UsefulLinksSection />
      <CallToAction />
      <LandingFooter />
    </div>
  );
};

export default UserLandingPage;
