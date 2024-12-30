import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Gebruiker } from '../model/Gebruiker';
import { Rekening } from '../model/Rekening';

interface CustomContextType {
    gebruiker: Gebruiker | undefined;
    setGebruiker: (gebruiker: Gebruiker | undefined) => void;
    actieveHulpvrager: Gebruiker | undefined;
    setActieveHulpvrager: (actieveHulpvrager: Gebruiker | undefined) => void;
    hulpvragers: Array<Gebruiker>;
    setHulpvragers: (hulpvragers: Array<Gebruiker>) => void;
    rekeningen: Array<Rekening>;
    setRekeningen: (rekeningen: Array<Rekening>) => void;
    isMobile: boolean;
    setIsMobile: (isMobile: boolean) => void;

}

const CustomContext = createContext<CustomContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCustomContext = (): CustomContextType => {
    const context = useContext(CustomContext);
    if (!context) {
        throw new Error('useCustomContext must be used within a CustomProvider');
    }
    return context;
};

interface CustomProviderProps {
    children: ReactNode;
}

export const CustomProvider: React.FC<CustomProviderProps> = ({ children }) => {
    const [gebruiker, setGebruiker] = useState<Gebruiker | undefined>(undefined);
    const [actieveHulpvrager, setActieveHulpvrager] = useState<Gebruiker | undefined>(undefined);
    const [hulpvragers, setHulpvragers] = useState<Array<Gebruiker>>([]);
    const [rekeningen, setRekeningen] = useState<Array<Rekening>>([]);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    return (
        <CustomContext.Provider value={{
            gebruiker, setGebruiker,
            actieveHulpvrager, setActieveHulpvrager,
            hulpvragers, setHulpvragers,
            rekeningen, setRekeningen,
            isMobile, setIsMobile}}>
            {children}
        </CustomContext.Provider>
    );
};
