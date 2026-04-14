import Lock from './lock.svg';
import Mail from './mail.svg';
import MedRoomBrand from './medRoom_logo.svg';
import MedRoomBrandFromLoadingScreen from './medRoom_logo_from_loading_screen.svg';
import OpenedEye from './opened_eye.svg';
import PaperRoll from './paper_roll.svg';
import Register from './register.svg';
import SignIn from './signin.svg';
import Suitcase from './suitcase.svg';
import Tag from './tag.svg';
import ClosedEye from './closed_eye.svg';
import Send from './send.svg';
import Check from './check.svg';
import UnfilledCheck from './unfilled_check.svg';
import LockReset from './lock_reset.svg';
import People from './people.svg';
import Schedule from './schedule.svg';
import Person from './person.svg';
import Home from './home.svg';
import KeyCard from './key_card.svg';
import Money from './money.svg';
import CreditCard from './credit_card.svg';
import Pix from './pix.svg';
import NewPerson from './new_person.svg'
import Cash from './cash.svg';
import Phone from './phone.svg';
import Lupe from './lupe.svg';
import Bell from './bell.svg';
import Logout from './logout.svg';
import Edit from './edit.svg';
import Customers from './customers.svg';
import Dashboard from './dashboard.svg';
import Room from './room.svg';
import Values from './values.svg';

import { FC } from "react";
import { SvgProps } from "react-native-svg";

export const Icons = {
  lock           : Lock,
  mail           : Mail,
  medRoom_logo   : MedRoomBrand,
  medRoom_logo_from_loading_screen : MedRoomBrandFromLoadingScreen,
  opened_eye     : OpenedEye,
  paper_roll     : PaperRoll,
  register       : Register,
  signin         : SignIn,
  suitcase       : Suitcase,
  tag            : Tag,
  closed_eye     : ClosedEye,
  send           : Send,
  check          : Check, 
  unfilled_check : UnfilledCheck,
  lock_reset     : LockReset,
  people         : People,
  home           : Home,
  schedule       : Schedule,
  person         : Person,
  key_card       : KeyCard,
  pix            : Pix,
  credit_card    : CreditCard,
  money          : Money,  
  cash           : Cash,
  new_person     : NewPerson,
  phone          : Phone,
  lupe           : Lupe,
  bell           : Bell,
  logout         : Logout,
  edit           : Edit,
  customers      : Customers,
  dashboard      : Dashboard,
  room           : Room,
  values         : Values,
} satisfies Record<string, FC<SvgProps>>;

export type IconName = keyof typeof Icons;