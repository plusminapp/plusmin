import React from "react";

interface StandIconProps {
  color: string; // De fill color van de cirkel
  borderColor: string; // De kleur van de rand
  height: number; // De hoogte (en breedte, omdat het een cirkel is)
  text: string; // De tekst in het midden van de cirkel
  outerText?: string; // De tekst buiten de cirkel
}

const StandIcon: React.FC<StandIconProps> = ({
  color,
  borderColor,
  height,
  text,
  outerText,
}) => {
  const radius = height / 2; // De straal van de cirkel
  const borderWidth = 5; // De dikte van de rand
  const outerRadius = radius + 15; // De straal van de buitenste tekst (10px buiten de cirkel)

  return (
    <svg
      width={height * 1.5} // Extra ruimte voor de buitenste tekst
      height={height * 1.5}
      viewBox={`0 0 ${height * 1.5} ${height * 1.5}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Definieer een pad voor de buitenste tekst */}
        <path
          id="outerTextPath"
          d={`
            M ${height * 0.75},${height * 0.75 - outerRadius}
            a ${outerRadius},${outerRadius} 0 1,1 0,${outerRadius * 2}
            a ${outerRadius},${outerRadius} 0 1,1 0,-${outerRadius * 2}
          `}
          fill="none"
        />
        {/* Omgekeerd pad voor correcte tekstweergave */}
        <path
          id="outerTextPathReversed"
          d={`
            M ${height * 0.75},${height * 0.75 + outerRadius}
            a ${outerRadius},${outerRadius} 0 1,0 0,-${outerRadius * 2}
            a ${outerRadius},${outerRadius} 0 1,0 0,${outerRadius * 2}
          `}
          fill="none"
        />
      </defs>

      {/* Cirkel met vulling en rand */}
      <circle
        cx={height * 0.75}
        cy={height * 0.75}
        r={radius - borderWidth / 2} // Houd rekening met de randdikte
        fill={color}
        stroke={borderColor}
        strokeWidth={borderWidth}
      />

      {/* Tekst in het midden */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={radius / 2} // Dynamische tekstgrootte
        fill="white" // Kleur van de tekst
        fontFamily="Roboto" // Lettertype gewijzigd naar Roboto
      >
        {text}
      </text>

      {/* Tekst buiten de cirkel */}
      {outerText && (
        <text
          fontSize={radius / 3} // Dynamische tekstgrootte voor de buitenste tekst
          fill={borderColor} // Kleur van de buitenste tekst
          textAnchor="middle"
          fontFamily="Roboto" // Lettertype gewijzigd naar Roboto
          >
          <textPath
            href="#outerTextPathReversed"
            startOffset="50%" // Zorgt ervoor dat de tekst gecentreerd is
            transform="rotate(180, 75, 75)" // Draait de tekst 108 graden rond het middelpunt van de cirkel
          >
            {outerText}
          </textPath>        
          </text>
      )}
    </svg>
  );
};

export default StandIcon;