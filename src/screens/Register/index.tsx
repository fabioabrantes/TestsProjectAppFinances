import {useState} from 'react';
import {Keyboard, Modal, Alert} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

import {useForm} from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';

import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

import {useNavigation} from '@react-navigation/native';
import { useAuth } from '../../hooks/auth';

import {InputForm} from '../../components/Forms/InputForm';
import {Button} from '../../components/Forms/Button';
import {TransactionTypeButton} from '../../components/Forms/TransactionTypeButton';
import {CategorySelectButton} from '../../components/Forms/CategorySelectButton';

import {CategorySelectContentModal} from '../CategorySelectContentModal';


import validationYup from '../../utils/validationYup';

import { 
  Container,
  Header,
  Title,
  Form,
  Fields,
  TransactionContainer 
} from './styles';


interface FormData{
  name:string;
  amount:string;
}

export function Register(){
  const navigation = useNavigation();

  const [transactionType, setTransactionType] =useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const {user} = useAuth();

  const [category, setCategory] = useState({
    key: 'category',
    name: 'Categoria'
  });
    

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(validationYup)/* faz com que o handlesubmit use o schema */
  });

  function handleTransactionTypeSelect(type:'positive' | 'negative'){
    setTransactionType(type);
  }

  function handleOpenSelectCategoryModal(){
    setCategoryModalOpen(true);
  }

  function handleCloseSelectCategoryModal(){
    setCategoryModalOpen(false);
  }

  async function handleRegister(form:FormData){
    if(!transactionType)
      return Alert.alert('Selecione o tipo da transação');

    if(category.key === 'category')
      return Alert.alert('Selecione a categoria');

    const newData ={
      id:String(uuid.v4()),
      name:form.name,
      amount: form.amount,
      type: transactionType,
      category:category.key,
      date: new Date(),
    }

    try {
      const dataKey = `@goFinances:transactions_user:${user.id}`;
      const transactionsOld = await AsyncStorage.getItem(dataKey);
      const transactionsOldFormatted = transactionsOld? JSON.parse(transactionsOld) :[];
      const transactionsUpdated =[
        ...transactionsOldFormatted,
        newData
      ];

      await AsyncStorage.setItem(dataKey, JSON.stringify(transactionsUpdated));
     
      // aqui limpando os dados do formulário
      reset();
      setTransactionType('');
      setCategory({
        key:'category',
        name:'Categoria'
      })
      // aqui informando uma msg de cadastro realizado com sucesso e depois
      // redireciona para outra página
      Alert.alert("Cadastro realizado com sucesso","",[
        {
          text:'Ok',
          onPress: () => {navigation.navigate("Listagem")}
        }
      ]);

    } catch (error) {
      console.log(error);
      Alert.alert("Não foi possível salvar");
    }
  }

   
  return (
    <TouchableWithoutFeedback 
      onPress={Keyboard.dismiss}
      containerStyle={{flex:1}}
      style={{flex:1}}
    >
      <Container>
        <Header>
          <Title>Cadastro</Title>
        </Header>

        <Form>
          <Fields>
            <InputForm
              name="name"
              control={control}
              placeholder="Nome"
              autoCapitalize="sentences"
              autoCorrect={false}
              error={errors.name}
            />
            <InputForm
              name="amount"
              control={control}
              placeholder="Preço"
              keyboardType="numeric"
              error={errors.amount}
            />

            <TransactionContainer>
              <TransactionTypeButton
                type="up"
                title="Income"
                onPress={()=> handleTransactionTypeSelect('positive')}
                isActive={transactionType === 'positive'}
              />
              <TransactionTypeButton
                type="down"
                title="Outcome"
                onPress={()=> handleTransactionTypeSelect('negative')}
                isActive={transactionType === 'negative'}
              />
            </TransactionContainer>

            <CategorySelectButton 
              title={category.name} 
              onPress={handleOpenSelectCategoryModal}
            />

          </Fields>

          <Button 
            title="Enviar" 
            onPress={handleSubmit(handleRegister)}
          />
        </Form>

        <Modal visible={categoryModalOpen} animationType="slide">
          <CategorySelectContentModal
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseSelectCategoryModal}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
   );
}

