import React from 'react';
import { Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

type Props = {
  currentWizardStep: number;
};

const STEPS = [1, 2, 3];

const WizardProgress = ({ currentWizardStep }: Props): React.JSX.Element => {
  
  const renderStep = (step: number) => {
    const isCompleted = currentWizardStep > step;
    const isAtLeastActive = currentWizardStep >= step;

    const bgStyle = isAtLeastActive ? 'bg-medroom-primary text-white' : 'bg-white text-medroom-primary';
    
    const paddingStyle = isCompleted ? 'px-2' : 'px-3.5';

    return (
      <View key={step} className="justify-center items-center border-2 border-medroom-primaryLight rounded-full p-2">
        <Text
          className={`text-2xl text-center rounded-full font-nunito-bold py-1.5 ${bgStyle} ${paddingStyle}`}
        >
          {isCompleted ? <Feather name="check" size={24} color="white" /> : step}
        </Text>
      </View>
    );
  };

  return (
    <View className="gap-2 flex-row items-center">
      {STEPS.map((step, index) => (
        <React.Fragment key={step}>
          {renderStep(step)}
          
          {index < STEPS.length - 1 && (
            <View 
              className={`h-1 flex-1 ${currentWizardStep > step ? 'bg-medroom-primary' : 'bg-medroom-primaryLight'}`} 
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

export default WizardProgress;