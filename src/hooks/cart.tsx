import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@GoMarketPlace:products');
      cart && setProducts(JSON.parse(cart));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const { id } = product;
      const productIndex = products.findIndex(item => item.id === id);

      const newProducts = [...products];
      if (productIndex >= 0) newProducts[productIndex].quantity += 1;
      else newProducts.push({ ...product, quantity: 1 });

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(item => item.id === id);
      const newProductList = [...products];
      newProductList[productIndex].quantity += 1;
      setProducts(newProductList);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newProductList),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(item => item.id === id);
      const newProductList = [...products];
      if (newProductList[productIndex].quantity - 1 === 0)
        newProductList.splice(productIndex, 1);
      else newProductList[productIndex].quantity -= 1;
      setProducts(newProductList);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newProductList),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
