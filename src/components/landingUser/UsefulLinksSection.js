// src/components/sections/UsefulLinksSection.js
import InfoCard from '../common/cards/InfoCard';
import { FaQuestionCircle, FaBook, FaHeadphones } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Container from '../layout/Container';

const cards = [
  {
    icon: <FaQuestionCircle />,
    title: 'FAQ',
    description: 'Answers to frequently asked questions about using the system',
    linkText: 'View FAQs',
    linkHref: '/faq',
    color: 'var(--color-primary)',
    delay: 0.1,
  },
  {
    icon: <FaBook />,
    title: 'User Guide',
    description: 'Detailed explanation of how to use all system features',
    linkText: 'Browse Guide',
    linkHref: '/guide',
    color: 'var(--color-danger)',
    delay: 0.3,
  },
  {
    icon: <FaHeadphones />,
    title: 'Contact Support',
    description: 'Having an issue? Our support team is ready to help',
    linkText: 'Contact Us',
    linkHref: '/support',
    color: 'var(--color-secondary)',
    delay: 0.5,
  },
];

const UsefulLinksSection = () => {
  return (
    <section className="bg-[var(--color-white)] py-20 px-4">
      <Container className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-14"
        >
          Useful Links
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 justify-items-center gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: card.delay }}
              whileHover={{ scale: 1.03 }}
              className="transition-all"
            >
              <InfoCard
                icon={card.icon}
                title={card.title}
                description={card.description}
                linkText={card.linkText}
                linkHref={card.linkHref}
                color={card.color}
                cardClass="bg-white hover:shadow-xl"
              />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default UsefulLinksSection;
