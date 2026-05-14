"use client";

import Image from "next/image";

const ExploreBtn = () => {
  return (
    <a href="#events" id="explore-btn" className="mt-7 mx-auto">
      <div>
        Explore Events
        <Image
          src="/icons/arrow-down.svg"
          alt="arrow-down"
          width={24}
          height={24}
        />
      </div>
    </a>
  );
};

export default ExploreBtn;
