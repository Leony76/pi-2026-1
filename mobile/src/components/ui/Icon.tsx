import { systemColors } from '@/constants/misc/systemColors.misc';
import React from 'react'
import { SvgProps } from 'react-native-svg';
import type { IconName } from 'root/assets/icons/index';
import { Icons } from 'root/assets/icons/index';

type Props = {
  name   : IconName;
  color? : string;
  sizes? : {
    width  : number;
    height : number;
  }
};

/**
 * @param name Nome do ícone (baseado nas chaves do objeto Icons)
 * @param color Cor para aplicar ao ícone (funciona via tintColor)
 * @param sizes Dimensões do ícone [altura (height) e largura (width)]
 * @returns O componente de ícone renderizado com suporte a cor dinâmica.
 * @example 
 * ```tsx
 * <Icon
 * name="lock"
 * color="#1AAFB4"
 * sizes={{ height: 24, width: 24 }}
 * />
 * ```
 */

const Icon = ({ name, color, sizes }: Props): React.JSX.Element | null => {

  const SvgIcon: React.FC<SvgProps> = Icons[name];
  const finalColor = color || systemColors.primary;

  if (!SvgIcon) {
    return null;
  }

  return (
    <SvgIcon 
      width={sizes?.width || 24} 
      height={sizes?.height || 24}
      fill={finalColor} 
    />  
  )
}

export default Icon