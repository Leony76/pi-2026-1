import React from 'react'
import { Text, View } from 'react-native'
import { formatDate } from '@/utils/formatDate';
import { formatHour } from '@/utils/formatHour';
import Label___Value from '../ui/Label___Value';
import { priceFormat } from '@/utils/priceFormat';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { systemColors } from '@/constants/misc/systemColors.misc';
import { FetchProfessionalPaymentsHistory } from '@/types/payment/fetchProfessionalPaymentsHistory.type';

type BaseProps = {
  separationRow? : boolean;
  gap? : `gap-${number}`;
};

type Props = BaseProps & FetchProfessionalPaymentsHistory;

const PaymentHistory = (props:Props): React.JSX.Element => {

  const fromMap = {
    ROOM_RENTAL: 'Aluguel de sala' 
  };

  const paymentMethodMap = {
    PIX         : 'Pix',  
    BANK_SLIP   : 'Boleto bancário',  
    CREDIT_CARD : 'Cartão de crédito'
  };

  return (
    <View className={`${props.gap ?? ''}`}>
      <View className='gap-2'>
        <View>
          <Text className='text-medroom-primary text-xl font-nunito-bold'>
            { fromMap[props.from] }
          </Text>
          <View className='flex-row gap-1 items-center'>
            <FontAwesome5 name="calendar-day" size={14} color={systemColors.secondary} />
            <Text className='text-[13px] mt-1 font-nunito text-medroom-secondary font-semibold'>
              { formatDate(props.createdAt) + ' - ' + formatHour(props.createdAt) }
            </Text>
          </View>
        </View>

        <Label___Value
          label='Método de pagamento'
          boldLabel
          value={{ _: paymentMethodMap[props.paymentMethod]}}
        />

        <Label___Value
          label='Hash de transação'
          boldLabel
          value={{ _: props.id}}
        />

        <Label___Value
          label='Valor pago'
          boldLabel
          value={{ _: priceFormat(props.paid), color: 'text-green-600' }}
        />
      </View>

      { props.separationRow &&
        <View className='h-0.5 w-fill bg-gray-200'/>
      }
    </View>
  )
}

export default PaymentHistory