import { useState, useRef, useEffect } from 'react'
import api from './userApi.js';
import './index.css'

function HeaderShop({ authorized, setSearchData , setAuthorized, setUser, user}) {
    let searchLine = useRef(null);
    const modalCreateProfil = useRef(null);
    const modalForLoginUser = useRef(null);
    const modalUserInfo = useRef(null);

    const modalCartRef = useRef(null);
    const [activeTab, setActiveTab] = useState('cart'); 
    const [cartData, setCartData] = useState({ items: [] });
    const [ordersData, setOrdersData] = useState([]);


    const loadCartAndOrders = async () => {
        const cartRes = await api('getCart');
        if (cartRes) setCartData(cartRes);
        
        const ordersRes = await api('getOrders');
        if (ordersRes) setOrdersData(ordersRes);
    };

    const handleCheckout = async () => {
        const res = await api('createOrder', 'POST');
        if (res) {
            alert('Замовлення успішно оформлено!');
            await loadCartAndOrders();
            setActiveTab('orders');
        } else {
            alert('Помилка оформлення замовлення');
        }
    };



    const [regData, setRegData] = useState({
        email: '',
        password: '',
        number: '',
        address: ''
    });

    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [editPhone, setEditPhone] = useState('');

    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [editAddress, setEditAddress] = useState('');

    useEffect(() => {
        if (user) {
            setEditPhone(user.number || '');
            setEditAddress(user.address || '');
        }
    }, [user]);

    const handleRegChange = (e) => {
        const { name, value } = e.target;
        setRegData(prev => ({ ...prev, [name]: value }));
    };

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            // Створюємо динамічну адресу
            const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            
            // Використовуємо її у fetch (зверни увагу на зворотні лапки ` `)
            let result = await fetch(`${BASE_URL}/registUser`,{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(regData)
            });

            if(result.ok) {
                alert('Реєстрація успішна!');
            } else if(result.status === 401) {
                alert('Така пошта вже використовується!');
            } else {
                console.log('Помилка реєстрації!');
            }
        } catch {
            console.log('Помилка реєстрації!');
        }

        setRegData({
            email: '',
            password: '',
            number: '',
            address: ''
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try{
            // Створюємо динамічну адресу
            const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            
            // Використовуємо її у fetch
            let result = await fetch(`${BASE_URL}/loginUser`,{
            method:'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(loginData)
        });


        let data = await result.json();

        if(result.ok){
            alert('Вхід успішний!');
            setAuthorized(true);
            setUser(data.user);
            modalForLoginUser.current.close();
        } 
        else if(result.status === 401){
            console.log(data);
            alert('Невірний email або пароль!');
        } 
        else {
          alert('Критична помилка сервера!');
        }
      } 
      catch {
        alert('Критична помилка сервера!');
      }

        setLoginData({
            email: '',
            password: ''
        })
    };

    const handleLogout = async () => {
  
        await api('logoutUser', 'POST'); 
        
        setAuthorized(false);
        setUser(null);
        modalUserInfo.current.close();
    };

    const handleUpdatePhone = async () => {
        const result = await api('updateUser', 'PUT', { number: editPhone });
        if (result) {
            setUser(result);
            setIsEditingPhone(false);
        } else {
            alert('Не вдалося оновити номер телефону');
            await api('logoutUser', 'POST');
            modalUserInfo.current.close();
            setAuthorized(false);
            setUser(null);
        }
    };

    const handleUpdateAddress = async () => {
        const result = await api('updateUser', 'PUT', { address: editAddress });
        if (result) {
            setUser(result);
            setIsEditingAddress(false);
        } else {
            alert('Не вдалося оновити адресу');
            await api('logoutUser', 'POST');
            modalUserInfo.current.close();
            setAuthorized(false);
            setUser(null);
        }
    };

    return (
        <div className='HeaderShop'>
            <img className='logo' src="/logoHeader.png" alt="Логотип" />
            <form className="searchForm">
                <input onChange={(e) => {
                    if (e.target.value === '') {
                        setSearchData('');
                    }
                }} ref={searchLine} className='searchLine' type="text" placeholder='Я шукаю...' />
                <button onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (searchLine.current) {
                        setSearchData(searchLine.current.value);
                    }
                }} className='searchBtn'>Пошук</button>
            </form>

            <dialog ref={modalCreateProfil} className='forCreateProfil modal-dialog'>
                <div className="modal-header">
                    <p className="modal-title">Реєстрація</p>
                    <button className="close-btn" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        modalCreateProfil.current.close();
                        setRegData({ email: '', password: '', number: '', address: '' });
                    }}>✕</button>
                </div>
                
                <form className="modal-form" onSubmit={handleRegister}>
                    <input type="email" name="email" placeholder="Електронна пошта" required value={regData.email} onChange={handleRegChange} />
                    <input type="password" name="password" placeholder="Пароль" required minLength="6" value={regData.password} onChange={handleRegChange} />
                    <input type="tel" name="number" placeholder="Номер телефону (напр. +380...)" required pattern="^\+?[0-9\s\-]{10,14}$" title="Введіть дійсний номер телефону" value={regData.number} onChange={handleRegChange} />
                    <input type="text" name="address" placeholder="Адреса доставки" required minLength="5" value={regData.address} onChange={handleRegChange} />
                    <button type="submit" className="submit-btn">Зареєструватися</button>
                </form>

                <div className="modal-footer">
                    <button className="switch-btn" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        modalCreateProfil.current.close();
                        modalForLoginUser.current.showModal();
                        setRegData({ email: '', password: '', number: '', address: '' });
                    }}>Вже маєте акаунт? Увійдіть!</button>
                </div>
            </dialog>

            <dialog ref={modalForLoginUser} className='forLoginUser modal-dialog'>
                <div className="modal-header">
                    <p className="modal-title">Вхід</p>
                    <button className="close-btn" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        modalForLoginUser.current.close();
                        setLoginData({ email: '', password: '' });
                    }}>✕</button>
                </div>

                <form className="modal-form" onSubmit={handleLogin}>
                    <input type="email" name="email" placeholder="Електронна пошта" required value={loginData.email} onChange={handleLoginChange} />
                    <input type="password" name="password" placeholder="Пароль" required value={loginData.password} onChange={handleLoginChange} />
                    <button type="submit" className="submit-btn">Увійти</button>
                </form>

                <div className="modal-footer">
                    <button className="switch-btn" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        modalForLoginUser.current.close();
                        modalCreateProfil.current.showModal();
                        setLoginData({ email: '', password: '' });
                    }}>Ще немає акаунта? Створіть акаунт!</button>
                </div>
            </dialog>

            <dialog ref={modalUserInfo} className='userInfo modal-dialog'>
                <div className="modal-header">
                    <p className="modal-title">Мій профіль</p>
                    <button className="close-btn" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditingPhone(false);
                        setIsEditingAddress(false);
                        modalUserInfo.current.close();
                    }}>✕</button>
                </div>
                
                <div className="user-details-container">
                    <div className="user-info-row">
                        <div className="info-group">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{user?.email || 'Немає даних'}</span>
                        </div>
                    </div>

                    <div className="user-info-row">
                        <div className="info-group flex-grow">
                            <span className="info-label">Телефон:</span>
                            {isEditingPhone ? (
                                <input 
                                    type="tel" 
                                    className="edit-input"
                                    value={editPhone} 
                                    onChange={(e) => setEditPhone(e.target.value)} 
                                />
                            ) : (
                                <span className="info-value">{user?.number || 'Немає даних'}</span>
                            )}
                        </div>
                        <div className="action-buttons">
                            {isEditingPhone ? (
                                <>
                                    <button className="icon-btn save-btn" onClick={handleUpdatePhone}>✓</button>
                                    <button className="icon-btn cancel-btn" onClick={() => {
                                        setIsEditingPhone(false);
                                        setEditPhone(user?.number || '');
                                    }}>✕</button>
                                </>
                            ) : (
                                <button className="edit-icon-btn" title="Редагувати телефон" onClick={() => setIsEditingPhone(true)}>✎</button>
                            )}
                        </div>
                    </div>

                    <div className="user-info-row">
                        <div className="info-group flex-grow">
                            <span className="info-label">Адреса доставки:</span>
                            {isEditingAddress ? (
                                <input 
                                    type="text" 
                                    className="edit-input"
                                    value={editAddress} 
                                    onChange={(e) => setEditAddress(e.target.value)} 
                                />
                            ) : (
                                <span className="info-value">{user?.address || 'Немає даних'}</span>
                            )}
                        </div>
                        <div className="action-buttons">
                            {isEditingAddress ? (
                                <>
                                    <button className="icon-btn save-btn" onClick={handleUpdateAddress}>✓</button>
                                    <button className="icon-btn cancel-btn" onClick={() => {
                                        setIsEditingAddress(false);
                                        setEditAddress(user?.address || '');
                                    }}>✕</button>
                                </>
                            ) : (
                                <button className="edit-icon-btn" title="Редагувати адресу" onClick={() => setIsEditingAddress(true)}>✎</button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="logout-btn" onClick={handleLogout}>Вийти з акаунту</button>
                </div>
            </dialog>
            <dialog ref={modalCartRef} className='cartModal modal-dialog' style={{ width: '600px', maxWidth: '90%' }}>
                <div className="modal-header">
                    <div className="tabs" style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            className={`tab-btn ${activeTab === 'cart' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('cart')}
                        >
                            Кошик
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('orders')}
                        >
                            Замовлення
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'past_orders' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('past_orders')}
                        >
                            Минулі замовлення
                        </button>
                    </div>
                    <button className="close-btn" onClick={(e) => {
                        e.preventDefault();
                        modalCartRef.current.close();
                    }}>✕</button>
                </div>

                <div className="modal-content-scrollable" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '10px' }}>
                    

                    {activeTab === 'cart' && (
                        <div>
                            {(!cartData.items || cartData.items.length === 0) ? (
                                <p style={{ textAlign: 'center', marginTop: '20px' }}>Ваш кошик порожній</p>
                            ) : (
                                <>
                                    {cartData.items.map((item, index) => (
                                        <div key={index} className="cart-item-row" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>

                                            <img src={item.productId?.imageUrl} alt={item.productId?.title} width="60" style={{ borderRadius: '5px' }} />
                                            
                                            <div style={{ flexGrow: 1 }}>
                                                <h4 style={{ margin: '0 0 5px 0' }}>{item.productId?.title}</h4>
                                                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Розмір: <strong>{item.size}</strong> • {item.productId?.price} ₴/шт.</p>
                                                
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                                                    <button 
                                                        disabled={item.quantity <= 1} 
                                                        onClick={async () => {
                                                            let res = await api('updateCartQuantity', 'PUT', { productId: item.productId._id, size: item.size, action: 'minus' });
                                                            if (res) loadCartAndOrders();
                                                        }}
                                                        style={{ padding: '2px 10px', fontSize: '16px', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', borderRadius: '3px', border: '1px solid #ccc' }}
                                                    >
                                                        -
                                                    </button>
                                                    
                                                    <span style={{ fontSize: '16px', minWidth: '30px', textAlign: 'center' }}>{item.quantity} шт.</span>
                                                    
                                                    <button 
                                                        onClick={async () => {
                                                            let res = await api('updateCartQuantity', 'PUT', { productId: item.productId._id, size: item.size, action: 'plus' });
                                                            if (res) loadCartAndOrders();
                                                        }}
                                                        style={{ padding: '2px 10px', fontSize: '16px', cursor: 'pointer', borderRadius: '3px', border: '1px solid #ccc' }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' }}>
                                                <strong style={{ fontSize: '16px' }}>{item.quantity * item.productId?.price} ₴</strong>
                                                
                                                <button 
                                                    onClick={async () => {
                                                        if (window.confirm(`Видалити товар "${item.productId?.title}" (Розмір: ${item.size}) з кошика?`)) {
                                                            let res = await api('removeFromCart', 'POST', { productId: item.productId._id, size: item.size });
                                                            if (res) loadCartAndOrders();
                                                        }
                                                    }}
                                                    style={{ 
                                                        backgroundColor: '#ef4444', 
                                                        color: 'white', 
                                                        border: 'none', 
                                                        padding: '4px 8px', 
                                                        borderRadius: '4px', 
                                                        cursor: 'pointer', 
                                                        fontSize: '13px' 
                                                    }}
                                                >
                                                    Видалити
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="cart-total-section" style={{ textAlign: 'right', marginTop: '15px' }}>
                                        <h3>Всього: {cartData.items.reduce((sum, item) => sum + (item.quantity * item.productId?.price), 0)} ₴</h3>
                                        <button className="submit-btn" onClick={handleCheckout} style={{ marginTop: '10px' }}>Оформити замовлення</button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div>
                            {ordersData.filter(o => o.status === 'В обробці' || o.status === 'В дорозі').length === 0 ? (
                                <p style={{ textAlign: 'center', marginTop: '20px' }}>У вас немає активних замовлень</p>
                            ) : (
                                ordersData
                                    .filter(order => order.status === 'В обробці' || order.status === 'В дорозі')
                                    .map(order => (
                                        <div key={order._id} className="order-card" style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                                <span><strong>Замовлення від:</strong> {new Date(order.date).toLocaleDateString()}</span>
                                                <span style={{ color: order.status === 'В дорозі' ? '#0284c7' : '#d97706', fontWeight: 'bold' }}>
                                                    {order.status === 'В дорозі' ? '🚚 Відправлено' : '⏳ В обробці'}
                                                </span>
                                            </div>
                                            <div style={{ marginTop: '10px' }}>
                                                {order.items.map((item, i) => (
                                                    <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px', marginBottom: '8px' }}>
                                                        <img src={item.imageUrl} alt={item.title} width="40" style={{ borderRadius: '4px' }} />
                                                        <span>{item.title} (Розмір: {item.size}) — {item.quantity} шт.</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <h4 style={{ textAlign: 'right', margin: '10px 0 0 0' }}>Сума: {order.totalAmount} ₴</h4>
                                        </div>
                                    ))
                            )}
                        </div>
                    )}

                    {activeTab === 'past_orders' && (
                        <div>
                            {ordersData.filter(o => o.status === 'Доставлено').length === 0 ? (
                                <p style={{ textAlign: 'center', marginTop: '20px' }}>Історія замовлень порожня</p>
                            ) : (
                                ordersData
                                    .filter(order => order.status === 'Доставлено')
                                    .map(order => (
                                        <div key={order._id} className="order-card" style={{ border: '1px solid #16a34a', backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #bbf7d0', paddingBottom: '10px' }}>
                                                <span><strong>Завершене замовлення від:</strong> {new Date(order.date).toLocaleDateString()}</span>
                                                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓ Доставлено</span>
                                            </div>
                                            <div style={{ marginTop: '10px' }}>
                                                {order.items.map((item, i) => (
                                                    <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px', marginBottom: '8px', opacity: '0.8' }}>
                                                        <img src={item.imageUrl} alt={item.title} width="40" style={{ borderRadius: '4px' }} />
                                                        <span>{item.title} (Розмір: {item.size}) — {item.quantity} шт.</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <h4 style={{ textAlign: 'right', margin: '10px 0 0 0', color: '#16a34a' }}>Сума: {order.totalAmount} ₴</h4>
                                        </div>
                                    ))
                            )}
                        </div>
                    )}

                </div>
            </dialog>

            <div className='ProfilCartIcons'>
                <button onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (authorized === false) {
                        modalCreateProfil.current.showModal();
                    }
                    else {
                        modalUserInfo.current.showModal();
                    }
                }} className='Profilbtn'>
                    <a className="icon-link" aria-label="Профіль">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </a>
                </button>
                <button onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (authorized === false) {
                        modalCreateProfil.current.showModal();
                    } else {
                        await loadCartAndOrders();
                        modalCartRef.current.showModal();
                    }
                }} className='Cartbtn'>
                    <a className="icon-link" aria-label="Кошик">
                        <div className="cart-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                        </div>
                    </a>
                </button>
            </div>
        </div>
    )
}

export default HeaderShop