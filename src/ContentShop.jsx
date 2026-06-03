import { useEffect, useRef, useState } from 'react';
import api from './userApi.js';

function ContentShop({ authorized, searchData }) {
  const modalSizeRef = useRef(null); 
  const [productToCart, setProductToCart] = useState(null); 
  const [selectedSize, setSelectedSize] = useState(''); 

  const [products, setProducts] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 8; 

  const [selectedCategory, setSelectedCategory] = useState('allProducts');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const [dynamicTypes, setDynamicTypes] = useState([]);
  
  const [filtersApplied, setFiltersApplied] = useState(0);

  let [choiseProduct, setChoiseProduct] = useState({
        title: '', 
        price: '', 
        count: '', 
        description: '', 
        category: '', 
        type: '', 
        imageUrl: '' 
  });
  let modalChoiseProductRef = useRef('');

  useEffect(() => {
    const fetchTypes = async () => {
        try {
            const response = await api('getTypes', 'GET');
            if (response) {
                setDynamicTypes(response);
            }
        } catch (error) {
            console.error('Помилка завантаження типів:', error);
        }
    };
    fetchTypes();
  }, []);

  async function fetchShopProducts() {
    try {
        let requestData = {
            page: currentPage,
            limit: limit,
            search: searchData,
            category: selectedCategory,
            types: selectedTypes,
            minPrice: minPrice,
            maxPrice: maxPrice
        };

        const response = await api('getShopProducts', 'POST', requestData);
        
        if (response && response.data) {
            setProducts(response.data);
            setTotalPages(response.totalPages);
        }
    } catch (error) {
        console.error('Помилка при отримані продуктів магазину!', error);
    }
  }

  useEffect(() => {
    fetchShopProducts();
  }, [currentPage, searchData, filtersApplied]);

  const applyFilters = () => {
    setCurrentPage(1); 
    setFiltersApplied(filtersApplied + 1); 
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleTypeChange = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); 

    if (category === 'allProducts') {
      return;
    }

    const conflictingCategory = category === 'forWoman' ? 'forMan' : 'forWoman';

    const forbiddenTypeValues = dynamicTypes
      .filter(t => t.category === conflictingCategory)
      .map(t => t.value);

    setSelectedTypes(prevSelected => 
      prevSelected.filter(chosenType => !forbiddenTypeValues.includes(chosenType))
    );
  };

  const openChoiseModal = (product) => {
    setChoiseProduct({
      title: product.title, 
      price: product.price, 
      count: product.count,
      description: product.description, 
      category: product.category,
      type: product.type, 
      imageUrl: product.imageUrl, 
      _id: product._id
    });
    setSelectedSize('');
    modalChoiseProductRef.current?.showModal();
  };

  return (
    <div className="contentShop">
      <aside className="filters">
        <h3 className="filter-title">Фільтри</h3>

        <div className="filter-group">
          <h4>Ціна (₴)</h4>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Від 0"
              onChange={(e) => setMinPrice(e.target.value !== '' ? Number(e.target.value) : 0)}
            />
            <span> - </span>
            <input
              type="number"
              placeholder="До 10000"
              onChange={(e) => setMaxPrice(e.target.value !== '' ? Number(e.target.value) : 10000)}
            />
          </div>
        </div>

        <div className="filter-group">
          <h4>Типи</h4>
          <ul className="filter-list">
            <li>
              <label>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === 'allProducts'}
                  onChange={() => handleCategoryChange('allProducts')}
                />
                Всі товари
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === 'forMan'}
                  onChange={() => handleCategoryChange('forMan')}
                />
                Чоловічий одяг
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === 'forWoman'}
                  onChange={() => handleCategoryChange('forWoman')}
                />
                Жіночий одяг
              </label>
            </li>
          </ul>
        </div>

        <div className='filter-group'>
          <h4>Категорія</h4>
          <ul className='filter-list'>
            {dynamicTypes
              .filter(typeObj => 
                  selectedCategory === 'allProducts' || 
                  typeObj.category === 'unisex' || 
                  typeObj.category === selectedCategory
              )
              .map(typeObj => (
              <li key={typeObj.value}>
                <label>
                  <input 
                    type='checkbox' 
                    checked={selectedTypes.includes(typeObj.value)} 
                    onChange={() => handleTypeChange(typeObj.value)} 
                  /> 
                  {typeObj.value}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <button className="apply-filters-btn" onClick={applyFilters}>
          Застосувати фільтри
        </button>
      </aside>

      <dialog className='aboutProduct' ref={modalChoiseProductRef}>
        <div className="modal-container">
          <button 
            className="close-modal-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              modalChoiseProductRef.current.close();
            }}
          >
            &#10005;
          </button>
          
          <div className="modal-content">
            {choiseProduct.imageUrl && (
              <div className="modal-image-wrapper">
                <img src={choiseProduct.imageUrl} alt={choiseProduct.title} />
              </div>
            )}
            
            <div className="modal-details">
              <span className="modal-category">
                {choiseProduct.category === 'forMan' ? 'Чоловічий' : choiseProduct.category === 'forWoman' ? 'Жіночий' : 'Унісекс'} • {choiseProduct.type}
              </span>
              <h2 className="modal-title">{choiseProduct.title}</h2>
              <p className="modal-price">{choiseProduct.price} ₴</p>
              
              <div className="modal-info-block">
                <h4>Опис:</h4>
                <p className="modal-description">{choiseProduct.description || "Опис відсутній."}</p>
              </div>

              <div className="modal-stock">
                <span>В наявності:</span> 
                <strong>{choiseProduct.count > 0 ? `${choiseProduct.count} шт.` : "Немає в наявності"}</strong>
              </div>
            </div>
          </div>
        </div>
      </dialog>
      
      <dialog className="modal-dialog" ref={modalSizeRef} style={{ width: '300px' }}>
        <div className="modal-header">
            <p className="modal-title">Вкажіть розмір</p>
            <button className="close-btn" onClick={(e) => {
                e.preventDefault();
                modalSizeRef.current.close();
            }}>✕</button>
        </div>

        <div className="modal-content" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
                type="text"
                placeholder="Введіть розмір (напр. M, 42, XL)"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                style={{ 
                  width: '100%', padding: '10px', borderRadius: '5px', fontSize: '16px',
                  border: '1px solid #ccc', boxSizing: 'border-box'
                }}
            />

            <button 
                className="submit-btn" 
                style={{ width: '100%' }}
                onClick={async (e) => {
                    e.preventDefault();
                    const sizeInput = selectedSize.trim();

                    if (sizeInput === '') {
                        alert('Будь ласка, введіть розмір перед додаванням!');
                        return;
                    }

                    if (productToCart && productToCart.description) {
                        const sizeMatch = productToCart.description.match(/Розмір:\s*([^\n]+)/i);
                        
                        if (sizeMatch) {
                            const sizeStr = sizeMatch[1].trim();
                            const sizeParts = sizeStr.split(',').map(s => s.trim()); 
                            let isValidSize = false;
                            const inputUpper = sizeInput.toUpperCase();

                            for (let part of sizeParts) {
                                const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
                                
                                if (rangeMatch) {
                                    const min = parseInt(rangeMatch[1], 10);
                                    const max = parseInt(rangeMatch[2], 10);
                                    const inputNum = parseInt(sizeInput, 10);

                                    if (!isNaN(inputNum) && inputNum >= min && inputNum <= max) {
                                        isValidSize = true;
                                        break;
                                    }
                                } else {
                                    if (part.toUpperCase() === inputUpper) {
                                        isValidSize = true;
                                        break;
                                    }
                                }
                            }

                            if (!isValidSize) {
                                alert(`Обраний розмір недоступний!\n\nДоступні розміри: ${sizeStr}`);
                                return;
                            }
                        }
                    }

                    let response = await api('addToCart', 'POST', { 
                        productId: productToCart._id, 
                        size: sizeInput 
                    });

                    if (response) {
                        alert(`Товар (Розмір: ${sizeInput}) успішно додано у кошик!`);
                        modalSizeRef.current.close();
                    } else {
                        alert('Помилка при додаванні у кошик');
                    }
                }}
            >
                Підтвердити
            </button>
        </div>
      </dialog>
      
      <div className='productContainer'>
          <main className="products">
            {products === null ? (
              <h1>Завантаження...</h1>
            ) : products.length === 0 ? (
              <h1>Товарів не знайдено</h1>
            ) : (
              products.map((product) => (
                <div onClick={(e) => {
                  e.stopPropagation();
                  openChoiseModal(product);
                }} key={product._id} className="product-card">
                  <div className="product-image">
                    <img src={product.imageUrl} alt={product.title} />
                  </div>
                  <div className="product-info">
                    <span className="product-category">
                      {product.category === 'forMan' ? 'Чоловічий' : product.category === 'forWoman' ? 'Жіночий' : 'Унісекс'} • {product.type}
                    </span>
                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-price">{product.price} ₴</p>
                    <button onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (authorized === false) {
                          alert('Будь ласка, увійдіть або створіть акаунт!');
                          return;
                      }

                      setProductToCart(product); 
                      setSelectedSize('');
                      modalSizeRef.current.showModal(); 
                  }} className="add-to-cart-btn">У кошик</button>
                  </div>
                </div>
              ))
            )}
          </main>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="pag-btn"
                style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                ← Попередня
              </button>
              
              <span className="pagination-info">
                Сторінка <strong>{currentPage}</strong> з <strong>{totalPages}</strong>
              </span>
              
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="pag-btn"
                style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Наступна →
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

export default ContentShop;