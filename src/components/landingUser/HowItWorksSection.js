// src/components/sections/HowItWorksSection.js
import InfoCard from '../common/cards/InfoCard';
import Container from '../layout/Container';
import { FaPaperPlane, FaSearch, FaStar } from 'react-icons/fa';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

const steps = [
  {
    icon: <FaPaperPlane />,
    title: 'Submit Your Inquiry',
    description: 'Choose the appropriate category and add question details',
    color: 'var(--color-secondary)',
  },
  {
    icon: <FaSearch />,
    title: 'Track Status',
    description: "Your inquiry is forwarded to the specialized trainer and you'll be notified when answered",
    color: 'var(--color-danger)',
  },
  {
    icon: <FaStar />,
    title: 'Rate Responses',
    description: 'Rate the responses and access your personal archive',
    color: 'var(--color-primary)',
  },
];

const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(-1);
  const controls = useAnimation();

  useEffect(() => {
    let timeouts = [];

    // تحريك الخط إلى كل بطاقة بالتسلسل
    steps.forEach((_, i) => {
      timeouts.push(setTimeout(() => setActiveStep(i), i * 700));
    });

    // توقّف عند البطاقة الثانية (الوسطى)
    timeouts.push(setTimeout(() => setActiveStep(1), steps.length * 700));

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <section className="bg-[var(--color-surface)] py-20 px-4 overflow-hidden">
      <Container className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-14"
        >
          How It Works
        </motion.h2>

        <div className="relative w-full max-w-6xl mx-auto">
          {/* الخط الكامل */}
          <div className="absolute top-1/2 left-[8%] right-[8%] h-1 bg-[var(--color-primary)] z-0 rounded-full transform -translate-y-1/2" />

          {/* البطاقات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start justify-items-center relative z-10">
            {steps.map((step, index) => {
              const isActive = index === activeStep || (activeStep === 1 && index === 1);
              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0.95, opacity: 0, y: 30 }}
                  animate={{
                    scale: isActive ? 1.07 : 1,
                    opacity: 1,
                    y: 0,
                    boxShadow: isActive
                      ? '0px 15px 25px rgba(0,0,0,0.1)'
                      : '0px 4px 10px rgba(0,0,0,0.05)',
                  }}
                  transition={{ duration: 0.5, delay: index * 0.7 }}
                >
                  <InfoCard
                    icon={step.icon}
                    title={step.title}
                    description={step.description}
                    color={step.color}
                    isActive={isActive}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HowItWorksSection;