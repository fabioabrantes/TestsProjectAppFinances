import {useState, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert,FlatList } from 'react-native';
import {getBottomSpace} from 'react-native-iphone-x-helper';

import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/auth';


import {HighlightCard} from '../../components/HighlightCard';
import {TransactionCard,TransactionCardProps} from '../../components/TransactionCard';
import { Loading } from '../../components/Loading';

import { 
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  IconPower,
  HighlightCards,
  Transactions,
  Title,
  LogoutButton,
  LoadContainer,
  EmptyTransactions
 } from './styles';

export interface DataListProps extends TransactionCardProps{
  id:string;
}

interface HighlightProps{
  amount:string;
  lastTransaction:string;
}

interface IHighlightData{
  entries: HighlightProps;
  expensive:HighlightProps;
  total:HighlightProps;
}

export function Dashboard(){
  const [isLoading, setIsLoading] = useState(true);
  const [dataTransactions, setDataTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<IHighlightData>({} as IHighlightData);

  const {signOut, user} = useAuth();

  const dataKey = `@goFinances:transactions_user:${user.id}`;

  function getLastTransactionDate(collectionTransaction:DataListProps[], type:string){
    
    const collectionFiltered = collectionTransaction
    .filter(transaction=> transaction.type===type);

    if(collectionFiltered.length === 0) return 0;

    // busca da última data de entrada com data no formato de número
    const lastDateTransactionFormatNumber = Math.max.apply(Math,
      collectionFiltered.map(transaction=> new Date(transaction.date).getTime())); // precisou do new Date para trasnformar em uma data pois está como string e também chamou gettime para transformar num número afim de usar o Math
    
    // depois coloca para o formato date  BR
    const lastDateTransactionFormatDate  = new Date (lastDateTransactionFormatNumber);
    
    return `${lastDateTransactionFormatDate.getDate()} de ${lastDateTransactionFormatDate.toLocaleString('pt-BR',{month:'long'})}`;
  }

  async function loadDataTransactions() {
    const data = await AsyncStorage.getItem(dataKey);
    let transactions =[];
    let transactionsFormatted:DataListProps[] =[];

    let entriesTotal = 0;
    let expensiveTotal = 0;

    if(data) {
      transactions = JSON.parse(data);
      /* console.log(transactions) */;
      transactionsFormatted = transactions
      .map((item:DataListProps)=>{

        if(item.type ==='positive'){
          entriesTotal += Number(item.amount);
        }else{
          expensiveTotal += Number(item.amount);
        }

        const amount = Number(item.amount)
        .toLocaleString('pt-BR',{
          style:'currency',
          currency:'BRL'
        });

        const date = Intl.DateTimeFormat('pt-BR',{
          day:'2-digit',
          month:'2-digit',
          year:'2-digit'
        }).format(new Date(item.date));
        
        return{
          id:item.id,
          name:item.name,
          amount,
          type:item.type,
          category:item.category,
          date
        }
      });
      //console.log(transactionsFormatted);
      setDataTransactions(transactionsFormatted);

      const lastDateTransactionEntries = getLastTransactionDate(transactions,'positive');
      const lastDateTransactionExpensive = getLastTransactionDate(transactions,'negative');
      
      let totalInterval ='';
      if (lastDateTransactionEntries === 0 && lastDateTransactionExpensive ===0){
        totalInterval = 'Não há transações';
      }else if (lastDateTransactionEntries !== 0 && lastDateTransactionExpensive ===0){
        totalInterval = `01 a ${lastDateTransactionEntries}`;
      }else{
        totalInterval = `01 a ${lastDateTransactionExpensive}`;
      }                                    

      const total = entriesTotal - expensiveTotal;

      setHighlightData({
          entries:{
            amount:entriesTotal.toLocaleString('pt-BR',{
              style:'currency',
              currency:'BRL'
            }),
            lastTransaction: lastDateTransactionEntries ===0 ? 
                              'Não há transações de entrada' 
                              : 
                              `Última entrada dia ${lastDateTransactionEntries}`,
          },
          expensive:{
            amount:expensiveTotal.toLocaleString('pt-BR',{
              style:'currency',
              currency:'BRL'
            }),
            lastTransaction: lastDateTransactionExpensive === 0 ?
                      'Não há transações de saídas' 
                      :
                      `Última saída dia ${lastDateTransactionExpensive}`,

          },
          total:{
            amount: total.toLocaleString('pt-BR',{
              style:'currency',
              currency:'BRL'
            }),
            lastTransaction:totalInterval,
          }
      })
      setIsLoading(false);
    }else{
      Alert.alert('Não existe transações armazenadas')
    }
    
  }

  async function removeAll() {
    await AsyncStorage.removeItem(dataKey);
  }

  useFocusEffect(useCallback(()=>{
    loadDataTransactions();
  },[]));
  
  return (
    <Container>
      {
        isLoading ?
          <LoadContainer>
            <Loading size='large'/>
          </LoadContainer>
        :
          <>
            <Header>
              <UserWrapper>
                <UserInfo>
                  <Photo source={{uri:user.photo}} />
                  <User>
                    <UserGreeting>Olá,</UserGreeting>
                    <UserName>{user.name}</UserName>
                  </User>
                </UserInfo>
                
                <LogoutButton onPress={signOut}>
                  <IconPower name="power" />
                </LogoutButton>
              </UserWrapper>
      
            </Header>
            
            <HighlightCards>
              <HighlightCard
                type="up"
                title="Entradas" 
                amount={highlightData.entries.amount}
                lastTransaction={highlightData.entries.lastTransaction}
              />
              <HighlightCard 
                type="down"
                title="Saídas" 
                amount={highlightData.expensive.amount}
                lastTransaction={highlightData.expensive.lastTransaction}
              />
              <HighlightCard 
                type="total"
                title="Total" 
                amount={highlightData.total.amount}
                lastTransaction={highlightData.total.lastTransaction}
              />
            </HighlightCards>
            
            <Transactions>
              <Title>Listagem</Title>

              <FlatList
                data={dataTransactions}
                keyExtractor={(item)=> item.id}
                renderItem={({item})=>  <TransactionCard data={item}/>}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: getBottomSpace()}}
                ListEmptyComponent={()=>(
                  <EmptyTransactions>Não existe transações atualmente</EmptyTransactions>
                )}
              />
            </Transactions>
        </>
      }
    </Container>
  );
}

