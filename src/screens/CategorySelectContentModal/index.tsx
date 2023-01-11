import { FlatList } from 'react-native-gesture-handler';

import { Button } from '../../components/Forms/Button';

import { categories } from '../../utils/categories';

import { 
  Container,
  Header,
  Title,
  Category,
  Icon,
  Name,
  Separator,
  Footer,
 } from './styles';

interface Category{
  name: string;
  key:string;
}
interface IProps{
  category: Category;
  setCategory:(category:Category) => void;
  closeSelectCategory: ()=>void;
}
export function CategorySelectContentModal({
  category,
  setCategory,
  closeSelectCategory
}:IProps){

  function handleCategorySelect(category: Category){
    setCategory(category);
  }
  
  return (
    <Container>
      <Header>
        <Title>Categoria</Title>
      </Header>

      <FlatList
        data={categories}
        style={{ flex: 1, width: '100%'}}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <Category
            onPress={() => handleCategorySelect(item)}
            isActive={category.key === item.key}
          >
            <Icon name={item.icon} />
            <Name>{item.name}</Name>
          </Category>
        )}
        ItemSeparatorComponent={() => <Separator />}
      />

      <Footer>
        <Button title="Selecionar" onPress={closeSelectCategory}/>
      </Footer>
    </Container>
  );
}

