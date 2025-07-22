import Button from '../common/buttons/Button'
import Container from '../layout/Container';
import { motion } from 'framer-motion';


const HeroSection = () => {
    return (
        <section className="bg-[var(--color-surface)]">
            <Container className="grid lg:grid-cols-2 gap-24 items-center py-32">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: .6 }}
                    viewport={{ once: true }}
                    className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left"
                >
                    <h1 className="text-3xl lg:text-5xl font-bold leading-tight mb-4">
                        Complete Training<br />Inquiry Management<br />System
                    </h1>
                    <p className="text-[var(--color-text-muted)] text-base mb-6">
                        A dedicated platform for organizing and managing customer service staff inquiries,
                        facilitating tracking and evaluation
                    </p>
                    <div className="flex gap-4 justify-center lg:justify-start">
                        <Button variant="primary">Get Started</Button>
                        <Button variant="secondary">Learn More</Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ scale: .8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: .5, delay: .2 }}
                    viewport={{ once: true }}
                    className="relative w-full h-full max-w-md mx-auto lg:mx-0"
                >

                    <div className="relative w-full h-full max-w-md mx-auto lg:mx-0">
                        <div className="absolute -top-3 -left-3 w-full h-full rounded-lg bg-[var(--color-primary)] z-0"></div>
                        <div className="relative bg-[var(--color-white)] p-6 rounded-lg shadow-xl z-10">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-4 bg-[var(--color-primary)]"></div>
                                <div className="h-4 bg-[var(--color-danger)]"></div>
                                <div className="h-4 bg-[var(--color-secondary)]"></div>
                            </div>
                            <div className="mt-4 h-3 bg-[var(--color-text-muted)] rounded w-3/4"></div>
                        </div>
                    </div>
                </motion.div>
            </Container>
        </section>
    );
};

export default HeroSection;