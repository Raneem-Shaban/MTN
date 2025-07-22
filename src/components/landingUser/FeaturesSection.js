import { FaComments, FaChartLine, FaBell } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Container from '../layout/Container';
import InfoCard from '../common/cards/InfoCard';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.15 },
  }),
};

const FeaturesSection = () => (
  <section className="bg-[var(--color-white)] py-20">
    <Container className="text-center">
      {/* Title section */}
      <motion.h2
        className="text-3xl font-bold mb-14"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        System Features
      </motion.h2>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center mx-auto">
        {[  // Array to iterate through each card
          {
            icon: <FaComments />,
            title: 'Inquiry Management',
            desc: 'Organize and categorize inquiries and automatically route them to specialized trainers',
            color: 'var(--color-secondary)',
          },
          {
            icon: <FaChartLine />,
            title: 'Performance Reports',
            desc: 'Detailed reports to measure trainer and department performance based on KPI indicators',
            color: 'var(--color-danger)',
          },
          {
            icon: <FaBell />,
            title: 'Instant Notifications',
            desc: 'Email notifications to track inquiry status and responses',
            color: 'var(--color-primary)',
          },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <InfoCard
              icon={item.icon}
              title={item.title}
              description={item.desc}
              color={item.color}
            />
          </motion.div>
        ))}
      </div>
    </Container>
  </section>
);

export default FeaturesSection;
