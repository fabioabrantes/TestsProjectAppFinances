import React, {createContext, ReactNode,useContext,useState,useEffect} from 'react';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';


/* o client_id e Redirect_uri estão no auth2 que criamos no projeto google */
const {CLIENT_ID} = process.env;
const {REDIRECT_URI} = process.env;


interface AuthProviderProps{
  children: ReactNode;
}

interface User{
  id:string;
  name:string;
  email:string;
  photo?:string;/* na conta apple não disponibiliza foto */
}

interface IAuthContextData{
  user:User;
  signInWithGoogle():Promise<void>;
  signInWithApple():Promise<void>;
  signOut():Promise<void>;
  userStorageLoading:boolean;
}

interface AuthorizationResponse{
  params:{
    access_token:string;
  };
  type:string;
}

const AuthContext =  createContext({} as IAuthContextData);

function AuthProvider({children}:AuthProviderProps){
  const [user,setUser] =useState<User>({} as User);
  const [userStorageLoading, setUserStorageLoading] = useState(true);
  
  const userStorageKey = '@goFinances:user';

  async function signInWithGoogle(){
    try {
                 
      /* aqui informamos o que queremos da google */
      const RESPONSE_TYPE='token';
      /* aqui informamos o que queremos acessar do usuário no nosso profile e email */
      const SCOPE=encodeURI('profile email');// o encodeURI vai retirar o espaço e fazer uma combinação de caracteres que vai ser compreensível na url

      const authUrl=`https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`; /* endpoint de autenticação da google */

      const {type, params} = await AuthSession.startAsync({authUrl}) as AuthorizationResponse;
      /* console.log(response); */

      if(type ==='success'){
        const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`);
        const userInfo = await response.json();
        /* console.log(userInfo);  */
        const userLogged:User ={
          id:userInfo.id,
          email: userInfo.email,
          name:userInfo.given_name,
          photo:userInfo.picture
        }
        setUser(userLogged);
        /* console.log(user); */
        await AsyncStorage.setItem(userStorageKey,JSON.stringify(userLogged));
      }
    } catch (error:any) {
      throw new Error(error);
    }
  }

  async function signInWithApple(){
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes:[
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,

        ]
      });

      if(credential){
        const name = credential.fullName!.givenName!;
        const photo =`https://ui-avatars.com/api/?name=${name}&length=1`;

        const userLogged={
          id: String(credential.user),
          email:credential.email!,
          name,
          photo,
        };
        setUser(userLogged);
        await AsyncStorage.setItem(userStorageKey,JSON.stringify(userLogged));
      }
      
    } catch (error:any) {
      throw new Error(error);
    }
  }

  async function signOut(){
    setUser({} as User);
    AsyncStorage.removeItem(userStorageKey);
  }

  useEffect(() => {
    async function loadUserStorageData(){
      const userStorage = await AsyncStorage.getItem(userStorageKey);
      if(userStorage){
        const userLogged = JSON.parse(userStorage) as User;
        setUser(userLogged);
      }
      setUserStorageLoading(false);

    }
    loadUserStorageData();
  },[]);

  return (
    <AuthContext.Provider value={{
      user,
      signInWithGoogle,
      signInWithApple,
      signOut,
      userStorageLoading
      }}
    >
        {children}
    </AuthContext.Provider>
  )
}

function useAuth(){
  const context = useContext(AuthContext);
  return context;
}

export {AuthProvider,useAuth}