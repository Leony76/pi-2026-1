import { ImageSourcePropType } from "react-native";

export const Icons = {
  lock         : require('./lock.svg'),
  mail         : require('./mail.svg'),
  medRoom_logo : require('./medRoom_logo.svg'),
  opened_eye   : require('./opened_eye.svg'),
  paper_roll   : require('./paper_roll.svg'),
  register     : require('./register.svg'),
  signin       : require('./signin.svg'),
  suitcase     : require('./suitcase.svg'),
  tag          : require('./tag.svg'),
  closed_eye   : require('./closed_eye.svg'),
} satisfies Record<string, ImageSourcePropType>;

export type IconName = keyof typeof Icons;