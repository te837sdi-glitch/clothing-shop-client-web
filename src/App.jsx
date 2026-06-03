import { useState,useEffect } from 'react'
import HeaderShop from './HeaderShop'
import ContentShop from './ContentShop'
import api from './userApi.js';

function App() {
  let [searchData,setSearchData] = useState('');

  let [authorized, setAuthorized] = useState(null);
  let [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let result = await api('getprofiluser');

        if (result === false) {
          setAuthorized(false);
          setUser(null);
        } 
        else 
        {
          setAuthorized(true);
          setUser(result);
        }
      } 
      catch (error) 
      {
        console.error("Помилка авторизації:", error);
        setAuthorized(false);
      }
    };

    checkAuth();
  }, []);

  if (authorized === null) return <h1>Loading...</h1>;

  return (
    <div className='container'>
      <HeaderShop authorized={authorized} setSearchData={setSearchData} setAuthorized={setAuthorized} setUser={setUser} user={user}></HeaderShop>
      <ContentShop authorized={authorized} searchData={searchData}></ContentShop>
    </div>
  )
}

export default App
