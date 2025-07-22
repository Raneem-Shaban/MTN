// src/components/common/sections/InfoBar.js
import React from 'react';
import { motion } from 'framer-motion';
import { FaLightbulb } from 'react-icons/fa';
import Container from '../layout/Container';

const InfoBar = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[var(--color-primary)] text-[var(--color-text-main)] px-4 md:px-6 lg:px-8 py-8"
    >
      <Container>
        <div className="max-w-6xl mx-auto flex items-start gap-5 px-2">
          {/* Icon */}
          <div className="min-w-[56px] min-h-[56px] w-14 h-16 rounded-full bg-[var(--color-white)] flex items-center justify-center text-[var(--color-primary)] text-2xl mt-1 shadow-sm">
            <FaLightbulb />
          </div>

          {/* Text */}
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold mb-2">Did You Know?</h3>
            <p className="text-sm md:text-base font-medium leading-relaxed text-left">
              You can reopen an inquiry if the response wasn't sufficient!
            </p>
          </div>
        </div>
      </Container>
    </motion.div >
  );
};

export default InfoBar;
