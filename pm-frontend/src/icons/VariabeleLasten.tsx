import React from 'react';

const VariabeleLastenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="24"
      height="24"
      {...props}
    >
      <g transform="rotate(90, 50, 50)">
        <path
          d="M50 10c-13.25 0-24 10.75-24 24s10.75 24 24 24 24 10.75 24 24-10.75 24-24 24-24-10.75-24-24"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
        />
      </g>
    </svg>
  );
};

export default VariabeleLastenIcon;
