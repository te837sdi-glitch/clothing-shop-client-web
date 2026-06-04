import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HeaderShop from './HeaderShop'
import ContentShop from './ContentShop'
import CartPage from './CartPage'
import api from './userApi.js';

function App() {
  let [searchData, setSearchData] = useState('');

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
    <BrowserRouter>
      <div className='container'>
        <Routes>
          <Route 
            path="/" 
            element={
              <>
                <HeaderShop 
                    authorized={authorized} 
                    setSearchData={setSearchData} 
                    setAuthorized={setAuthorized} 
                    setUser={setUser} 
                    user={user} 
                />
                <ContentShop authorized={authorized} searchData={searchData} />
              </>
            } 
          />

          <Route 
            path="/cart" 
            element={<CartPage />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App