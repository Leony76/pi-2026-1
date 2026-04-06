import React from 'react'
import { Image } from 'react-native'
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

const Icon = ({ name, color, sizes }: Props) => {
  return (
    <Image 
      source={Icons[name]} 
      resizeMode="contain" 
      style={{ 
        width     : sizes?.width || 24, 
        height    : sizes?.height || 24,
        tintColor : color,
      }} 
    />    
  )
}

export default Icon