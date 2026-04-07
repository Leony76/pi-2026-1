import { Text, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const Error = ({ error }:{error:string}) => {
  if (!error) return null;
  return (
    <View className='flex-row gap-0.5 items-center'>  
      <MaterialIcons 
        name="error-outline" 
        size={16} 
        color="#ef4444" 
        className='mt-1'
      />

      <Text className="text-red-500 text-xs mt-1 font-nunito">
        { error }
      </Text>
    </View>
  )
}

export default Error