import React, { useState, useEffect } from 'react';
import TrainersBoard from '../../components/trainersBoard/TrainersBoard';

const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="relative min-h-screen p-5">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>
        Tasks
      </h1>
      <div className="pr-24 sm:pl-8 sm:pr-32 md:pl-12 md:pr-40 lg:pl-16 lg:pr-44">
        <TrainersBoard />
      </div>
    </main>
  )
}


export default Tasks
