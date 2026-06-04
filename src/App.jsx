// import { useState,useEffect } from 'react'
// import HeaderShop from './HeaderShop'
// import ContentShop from './ContentShop'
// import api from './userApi.js';

// function App() {
//   let [searchData,setSearchData] = useState('');

//   let [authorized, setAuthorized] = useState(null);
//   let [user, setUser] = useState(null);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         let result = await api('getprofiluser');

//         if (result === false) {
//           setAuthorized(false);
//           setUser(null);
//         } 
//         else 
//         {
//           setAuthorized(true);
//           setUser(result);
//         }
//       } 
//       catch (error) 
//       {
//         console.error("Помилка авторизації:", error);
//         setAuthorized(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   if (authorized === null) return <h1>Loading...</h1>;

//   return (
//     <div className='container'>
//       <HeaderShop authorized={authorized} setSearchData={setSearchData} setAuthorized={setAuthorized} setUser={setUser} user={user}></HeaderShop>
//       <ContentShop authorized={authorized} searchData={searchData}></ContentShop>
//     </div>
//   )
// }

// export default App

import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // ДОДАНО імпорти для маршрутизації
import HeaderShop from './HeaderShop'
import ContentShop from './ContentShop'
import CartPage from './CartPage' // ДОДАНО імпорт нової сторінки кошика
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
    // Обертаємо весь додаток у BrowserRouter
    <BrowserRouter>
      <div className='container'>
        {/* Хедер залишається поза Routes, тому він буде відображатися на всіх сторінках */}
        <HeaderShop 
            authorized={authorized} 
            setSearchData={setSearchData} 
            setAuthorized={setAuthorized} 
            setUser={setUser} 
            user={user} 
        />
        
        {/* Routes визначає, який компонент показувати залежно від шляху */}
        <Routes>
          {/* Головна сторінка магазину */}
          <Route 
            path="/" 
            element={<ContentShop authorized={authorized} searchData={searchData} />} 
          />
          
          {/* Нова сторінка кошика */}
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