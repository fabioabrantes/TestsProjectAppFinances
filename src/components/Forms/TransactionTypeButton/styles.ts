import styled,{css} from 'styled-components/native';

import {RectButton} from 'react-native-gesture-handler';
import {Feather} from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';



interface PropsIcon{
  type?:'up' | 'down';
}

interface Props extends PropsIcon{
  isActive:boolean;
}

export const Container = styled.View<Props>`
  width: 48%;
  

  border-width: ${({isActive})=> isActive? 1.5 : .3}px;
  border-style: solid;
  border-color: ${({theme})=>theme.colors.text};

  border-radius: 5px;
   
  ${({isActive,type})=> 
    isActive&&type==='down' && css`
      background-color: ${({ theme})=>theme.colors.attention_light}
  `}

  ${({isActive,type})=> 
    isActive&&type==='up' && css`
      background-color: ${({ theme})=>theme.colors.success_light}
  `}
`;

export const Icon = styled(Feather)<Props>`
  font-size: ${RFValue(24)}px;
  margin-right: 12px;

  color:${({theme})=>theme.colors.text}

  ${({isActive,type})=> 
    isActive&&type==='up' && css`
      color: ${({ theme})=>theme.colors.success}
  `}

  ${({isActive,type})=> 
    isActive&&type==='down' && css`
      color: ${({ theme})=>theme.colors.attention}
  `}
`;

export const Title = styled.Text<Props>`
  font-family: ${({theme})=>theme.fonts.regular};
  font-size: ${RFValue(14)}px;

  color: ${({theme, isActive})=>isActive? theme.colors.text_dark : theme.colors.text};
  
`;
export const Button = styled(RectButton)`
  flex-direction: row;
  align-items:center;
  justify-content:center;
  padding: 16px;
`;