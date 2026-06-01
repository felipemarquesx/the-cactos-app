import React, { createContext, useContext, useState, ReactNode } from 'react';

type Produto = {
  id: string;
  nome: string;
  preco: number;
  imagemUrl: string;
  quantidade: number;
};

type CartContextType = {
  items: Produto[];
  adicionarProduto: (produto: any) => void;
  removerProduto: (id: string) => void;
  limparCarrinho: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Produto[]>([]);

  const adicionarProduto = (produto: any) => {
    setItems((prevItems) => {
      const itemExiste = prevItems.find((item) => item.id === produto.id);
      if (itemExiste) {
        return prevItems.map((item) =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...prevItems, { ...produto, quantidade: 1 }];
    });
  };

  const removerProduto = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const limparCarrinho = () => {
    setItems([]);
  };

  const total = items.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  return (
    <CartContext.Provider value={{ items, adicionarProduto, removerProduto, limparCarrinho, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}
