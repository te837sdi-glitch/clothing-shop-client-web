import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './userApi.js';
import './index.css';

function CartPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('cart'); 
    const [cartData, setCartData] = useState({ items: [] });
    const [ordersData, setOrdersData] = useState([]);

    const loadCartAndOrders = async () => {
        const cartRes = await api('getCart');
        if (cartRes) setCartData(cartRes);
        
        const ordersRes = await api('getOrders');
        if (ordersRes) setOrdersData(ordersRes);
    };

    useEffect(() => {
        loadCartAndOrders();
    }, []);

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

    return (
        <div className="cart-page-container">
            <div className="cart-page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Повернутися до магазину
                </button>
                <h2>Ваш кабінет покупок</h2>
            </div>

            <div className="cart-page-tabs">
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

            <div className="cart-page-content">
                {activeTab === 'cart' && (
                    <div className="cart-section">
                        {(!cartData.items || cartData.items.length === 0) ? (
                            <div className="empty-state">Ваш кошик порожній</div>
                        ) : (
                            <>
                                {cartData.items.map((item, index) => (
                                    <div key={index} className="cart-item-row">
                                        <img src={item.productId?.imageUrl} alt={item.productId?.title} className="cart-item-img" />
                                        
                                        <div className="cart-item-details">
                                            <h4>{item.productId?.title}</h4>
                                            <p className="cart-item-meta">Розмір: <strong>{item.size}</strong> • {item.productId?.price} ₴/шт.</p>
                                            
                                            <div className="quantity-controls">
                                                <button 
                                                    disabled={item.quantity <= 1} 
                                                    onClick={async () => {
                                                        let res = await api('updateCartQuantity', 'PUT', { productId: item.productId._id, size: item.size, action: 'minus' });
                                                        if (res) loadCartAndOrders();
                                                    }}
                                                    className="qty-btn"
                                                >-</button>
                                                
                                                <span className="qty-display">{item.quantity} шт.</span>
                                                
                                                <button 
                                                    onClick={async () => {
                                                        let res = await api('updateCartQuantity', 'PUT', { productId: item.productId._id, size: item.size, action: 'plus' });
                                                        if (res) loadCartAndOrders();
                                                    }}
                                                    className="qty-btn"
                                                >+</button>
                                            </div>
                                        </div>

                                        <div className="cart-item-actions">
                                            <strong className="item-total">{item.quantity * item.productId?.price} ₴</strong>
                                            
                                            <button 
                                                onClick={async () => {
                                                    if (window.confirm(`Видалити товар "${item.productId?.title}" (Розмір: ${item.size}) з кошика?`)) {
                                                        let res = await api('removeFromCart', 'POST', { productId: item.productId._id, size: item.size });
                                                        if (res) loadCartAndOrders();
                                                    }
                                                }}
                                                className="remove-btn"
                                            >
                                                Видалити
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="cart-total-section">
                                    <h3>Всього: {cartData.items.reduce((sum, item) => sum + (item.quantity * item.productId?.price), 0)} ₴</h3>
                                    <button className="submit-btn checkout-btn" onClick={handleCheckout}>Оформити замовлення</button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="orders-section">
                        {ordersData.filter(o => o.status === 'В обробці' || o.status === 'В дорозі').length === 0 ? (
                            <div className="empty-state">У вас немає активних замовлень</div>
                        ) : (
                            ordersData
                                .filter(order => order.status === 'В обробці' || order.status === 'В дорозі')
                                .map(order => (
                                    <div key={order._id} className="order-card active-order">
                                        <div className="order-header">
                                            <span><strong>Замовлення від:</strong> {new Date(order.date).toLocaleDateString()}</span>
                                            <span className={`order-status ${order.status === 'В дорозі' ? 'status-transit' : 'status-processing'}`}>
                                                {order.status === 'В дорозі' ? '🚚 Відправлено' : '⏳ В обробці'}
                                            </span>
                                        </div>
                                        <div className="order-items">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="order-item-mini">
                                                    <img src={item.imageUrl} alt={item.title} />
                                                    <span>{item.title} (Розмір: {item.size}) — {item.quantity} шт.</span>
                                                </div>
                                            ))}
                                        </div>
                                        <h4 className="order-total">Сума: {order.totalAmount} ₴</h4>
                                    </div>
                                ))
                        )}
                    </div>
                )}

                {activeTab === 'past_orders' && (
                    <div className="orders-section">
                        {ordersData.filter(o => o.status === 'Доставлено').length === 0 ? (
                            <div className="empty-state">Історія замовлень порожня</div>
                        ) : (
                            ordersData
                                .filter(order => order.status === 'Доставлено')
                                .map(order => (
                                    <div key={order._id} className="order-card completed-order">
                                        <div className="order-header">
                                            <span><strong>Завершене замовлення від:</strong> {new Date(order.date).toLocaleDateString()}</span>
                                            <span className="order-status status-delivered">✓ Доставлено</span>
                                        </div>
                                        <div className="order-items">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="order-item-mini completed">
                                                    <img src={item.imageUrl} alt={item.title} />
                                                    <span>{item.title} (Розмір: {item.size}) — {item.quantity} шт.</span>
                                                </div>
                                            ))}
                                        </div>
                                        <h4 className="order-total">Сума: {order.totalAmount} ₴</h4>
                                    </div>
                                ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CartPage;