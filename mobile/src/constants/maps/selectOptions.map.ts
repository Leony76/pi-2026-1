export const FULL_OPTIONS_MAP = {
  SPECIALTY: [ 
    { value: 'generalMedicine', label: 'Medicina geral' },
    { value: 'psychology'     , label: 'Psicologia'     },
    { value: 'dermatology'    , label: 'Dermatologia'   },
    { value: 'pediatrics'     , label: 'Pediatria'      },
    { value: 'orthopedics'    , label: 'Ortopedia'      },
  ],
} as const;

export type Specialty = typeof FULL_OPTIONS_MAP.SPECIALTY[number]['value'];

//

export type FullOptionsMap = typeof FULL_OPTIONS_MAP;

export type FullOptionsMapKeys = keyof typeof FULL_OPTIONS_MAP;

export const OPTIONS_MAP: FullOptionsMap = {
  SPECIALTY: FULL_OPTIONS_MAP.SPECIALTY,
}