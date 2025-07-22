// src/components/common/layout/Container.js
/**
 * Wrapper that gives every section:
 * 1. نفس الـ max‑width
 * 2. حشوة جانبية متجاوبة ومتّسقة
 * 3. تمركز أفقي تلقائي
 */
const Container = ({ className = '', children }) => (
  <div className={`w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

export default Container;
