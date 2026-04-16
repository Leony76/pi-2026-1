export type SelectOption = {
  readonly value: string;
  readonly label: string;
}

export const FULL_OPTIONS_MAP = {
  SPECIALTY: [ 
    { value: 'generalMedicine', label: 'Medicina geral' },
    { value: 'psychology'     , label: 'Psicologia'     },
    { value: 'dermatology'    , label: 'Dermatologia'   },
    { value: 'pediatrics'     , label: 'Pediatria'      },
    { value: 'orthopedics'    , label: 'Ortopedia'      },
  ],
  FLOORS: [
    { value: 'groundFloor' , label: 'Térreo'   },
    { value: 'firstFloor'  , label: '1º andar' },
    { value: 'secondFloor' , label: '2º andar' },
    { value: 'thirdFloor'  , label: '3º andar' },
    { value: 'fourthFloor' , label: '4º andar' },
    { value: 'fifthFloor'  , label: '5º andar' },
  ],
  CHARACTERISTCS: [
    { value: 'airConditioner' , label: 'Climatizado' },
    { value: 'soundproofed'   , label: 'Isonorizado' },
    { value: 'airConditionerPlusSoundproofed' , label: 'Climatizado + Isonorizado' },
    { value: 'default'        , label: 'Padrão'      },
  ],
} as const;

export type Specialty = typeof FULL_OPTIONS_MAP.SPECIALTY[number]['value'];

//

export type FullOptionsMap = typeof FULL_OPTIONS_MAP;

export type FullOptionsMapKeys = keyof typeof FULL_OPTIONS_MAP;

export const OPTIONS_MAP: Record<FullOptionsMapKeys, readonly SelectOption[]> = {
  SPECIALTY      : FULL_OPTIONS_MAP.SPECIALTY,
  FLOORS         : FULL_OPTIONS_MAP.FLOORS,
  CHARACTERISTCS : FULL_OPTIONS_MAP.CHARACTERISTCS,
};