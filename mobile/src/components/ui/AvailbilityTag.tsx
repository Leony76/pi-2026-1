import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  isAvailable: boolean;
  closed?: boolean;
  aboslute?: string;
  textSm?: boolean;
  tagType: 'ACTIVITY' | 'AVAILIBITY' | 'OCCUPANCY';
};

const AvailbilityTag = ({
  isAvailable,
  closed,
  aboslute,
  textSm,
  tagType,
}: Props): React.JSX.Element => {

  const LABELS = {
    AVAILIBITY: {
      true: 'Disponível',
      false: 'Indisponível',
    },
    ACTIVITY: {
      true: 'Ativo',
      false: 'Inativo',
    },
    OCCUPANCY: {
      true: 'Desocupado',
      false: 'Ocupado',
    },
  } as const;

  let label = '';
  let containerStyle = '';
  let textStyle = '';

  if (closed) {
    label = 'Encerrado';
    containerStyle = 'border-gray-300 bg-gray-100';
    textStyle = 'text-medroom-secondary';
  } else {
    label = LABELS[tagType][String(isAvailable) as 'true' | 'false'];

    containerStyle = isAvailable
      ? 'border-green-400 bg-green-100'
      : 'border-red-400 bg-red-100';

    textStyle = isAvailable
      ? 'text-green-600'
      : 'text-red-600';
  }

  return (
    <View
      className={`
        py-1 rounded-lg justify-center items-center border
        ${containerStyle}
        ${aboslute ?? ''}
        ${tagType === 'ACTIVITY' ? 'px-3' : 'px-6'}
      `}
    >
      <Text
        className={`
          font-nunito
          ${textStyle}
          ${textSm ? 'text-sm' : ''}
        `}
      >
        {label}
      </Text>
    </View>
  );
};

export default AvailbilityTag;