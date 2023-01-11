import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VictoryPie } from 'victory-native';// componente que renderiza o gráfico de pizza

import { RFValue } from 'react-native-responsive-fontsize';

import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useFocusEffect } from '@react-navigation/native'; 
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from 'styled-components';

import { useAuth } from '../../hooks/auth';

import { categories } from '../../utils/categories';

import { HistoryCard } from '../../components/HistoryCard';
import { Loading } from '../../components/Loading';

import {
  Container,
  Header,
  Title,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
  LoadContainer
} from './styles';


interface TransactionData {
  type: 'positive' | 'negative';
  name: string;
  amount: string;
  category: string;
  date: string;  
}

interface CategoryData {
  key: string;
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
  percent: string;
}

export function Resume(){
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); // inicializa com a data atual
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);

  const {user} = useAuth();
  const theme = useTheme();

  function handleDateChange(action: 'next' | 'prev'){
    if(action === 'next'){
      setSelectedDate(addMonths(selectedDate, 1)); // o addMonths adiciona um mês e retorna uma new date() uma nova data
    }else{
      setSelectedDate(subMonths(selectedDate, 1)); // inverso do addMonth
    }
  }

  async function loadData() {
    setIsLoading(true);
    const dataKey = `@goFinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    // aqui trasnforma a string no array de transações
    const responseFormatted = response ? JSON.parse(response) : [];

    // aqui pega filtrado pelo tipo de transação. pegando somente os gastos
    // depois filtra pelas transações de gasto no mês e ano pedido
    const expensives = responseFormatted
    .filter((expensive: TransactionData) =>
      expensive.type === 'negative' &&
      new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
      new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
    );

    // calcula o gasto total existente para usar no calculo da percentagem
    const expensivesTotal = expensives
    .reduce((acumullator: number, expensive: TransactionData) => {
      return acumullator + Number(expensive.amount);
    }, 0);
    
    // vai armazenar objetos com as informações que será utilizado para atualizar no estado totalByCategories
    //informações como key, name, color total, totalFormatted, percent
    const totalByCategory: CategoryData[] = [];

    // para cada categoria tenho que somar os gastos
    categories.forEach(category => {
      let categorySum = 0;

      // na categoria atual soma os gastos existente nela
      expensives.forEach((expensive: TransactionData) => {
        if(expensive.category === category.key){
          categorySum += Number(expensive.amount);
        }
      });

      // aqui não permite as categorias sem gastos. não faz sentido visualizar nos gráficos
      if(categorySum > 0){
        // aqui formata para moeda brasileira
        const totalFormatted = categorySum
        .toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })

        // calcula o percentual do valor de cada categoria
        const percent = `${((categorySum / expensivesTotal) * 100).toFixed(0)}%`;

        // aqui insere no array
        totalByCategory.push({
          key: category.key,
          name: category.name,
          color: category.color,
          total: categorySum,
          totalFormatted,
          percent
        });
      }
    });
    // adiciona no estado o array contendo so objetos com as informações que serão visto nos componentes
    setTotalByCategories(totalByCategory);
    setIsLoading(false);
  }


  useFocusEffect(useCallback(() => {
    loadData();
  },[selectedDate]));// se mudar carrega novamente


  return(
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      {
        isLoading ?
            <LoadContainer>
              <Loading size="large" />
            </LoadContainer> 
          :
            <Content
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: useBottomTabBarHeight(), // para dar um espaçamento em relação a barra. isso vai fazer rolar até o fim
              }}
            >

              <MonthSelect>
                <MonthSelectButton onPress={() => handleDateChange('prev')}>
                  <MonthSelectIcon name="chevron-left"/>
                </MonthSelectButton>

                <Month> {/* recebe uma data, o formato que deseja exibir, objeto contendo tipo de data do Brasil */}
                  { format(selectedDate, 'MMMM, yyyy', {locale: ptBR}) } 
                </Month>

                <MonthSelectButton onPress={() => handleDateChange('next')}>
                  <MonthSelectIcon name="chevron-right"/>
                </MonthSelectButton>
              </MonthSelect>

              <ChartContainer>
                <VictoryPie
                  data={totalByCategories}
                  colorScale={totalByCategories.map(category => category.color)} //passa as cores de cada categoria
                  style={{
                    labels: {
                      fontSize: RFValue(18),
                      fontWeight: 'bold',
                      fill: theme.colors.shape
                    }
                  }}
                  labelRadius={50} // aqui esse valor traz o label para dentro da pizza
                  x="percent" // passa o valor do eixo de x pq no data não está no formato que pedi na documentação (x,y)
                  y="total"// passa o valor do eixo de y
                />
              </ChartContainer>

              {
                totalByCategories.map(item => (
                  <HistoryCard
                    key={item.key}
                    title={item.name}
                    amount={item.totalFormatted}
                    color={item.color}
                  />
                ))
              }
          </Content>          
    }
    </Container>
  )
}
