import {ActivityIndicatorProps} from 'react-native';

import { Container,Spinner } from './styles';

interface IProps extends ActivityIndicatorProps{
  color?: string;
}
export function Loading({color="#5636d3",...rest}:IProps){

  return (
    <Container>
      <Spinner color={color} {...rest}/>
    </Container>
  );
}