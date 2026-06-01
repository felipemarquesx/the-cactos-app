import React from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';

const { height: altura } = Dimensions.get('window');

const colors = {
  background: '#EDE2CF',
  card: '#FAF4E8',
  textDark: '#3B4A3F',
  accent: '#AC5D21',
  muted: '#A89370',
  border: '#D9C9B0',
};

export default function PedidosScreen() {
  const { items, total, removerProduto, limparCarrinho } = useCart();

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cardItem}>
      <Image source={{ uri: item.imagemUrl }} style={styles.imagem} />
      <View style={styles.info}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.quantidade}>Qtd: {item.quantidade}</Text>
        <Text style={styles.preco}>R$ {(item.preco * item.quantidade).toFixed(2)}</Text>
      </View>
      <TouchableOpacity onPress={() => removerProduto(item.id)} style={styles.btnRemover}>
        <Text style={styles.btnRemoverText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.titulo}>Seu Pedido</Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.emptyArea}>
            <Text style={styles.emptyText}>Seu carrinho está vazio 🌵</Text>
          </View>
        }
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValor}>R$ {total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.btnFinalizar} onPress={async () => {
            try {
              const user = auth.currentUser;
              if (!user) return alert('Você precisa estar logado!');

              // 1. Pega o nome do primeiro item (para atualizar o "Prato Mais Pedido" de forma simples)
              const pratoFavorito = items[0]?.nome || "Variados";

              // 2. Cria o registro do pedido no histórico
              await addDoc(collection(db, 'pedidos'), {
                userId: user.uid,
                items: items.map(i => ({ nome: i.nome, preco: i.preco, quantidade: i.quantidade })),
                total: total,
                data: new Date().toISOString(),
                status: 'entregue'
              });

              // 3. Atualiza o Firestore com as novas estatísticas
              const userRef = doc(db, 'usuarios', user.uid);
              await updateDoc(userRef, {
                visitasTotais: increment(1),
                pontos: increment(150), // Ganha 150 pontos por pedido
                pratoMaisPedido: pratoFavorito
              });

              alert('Pedido enviado! Você ganhou 150 pontos de fidelidade. 🌵🍴');
              limparCarrinho();
            } catch (error) {
              console.error("Erro ao finalizar pedido:", error);
              alert('Erro ao processar pedido. Tente novamente.');
            }
          }}>
            <Text style={styles.btnFinalizarText}>FINALIZAR PEDIDO</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: altura * 0.05,
    paddingBottom: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textDark,
  },
  lista: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  cardItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagem: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  nome: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
  quantidade: {
    fontSize: 14,
    color: colors.muted,
  },
  preco: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  btnRemover: {
    padding: 8,
  },
  btnRemoverText: {
    fontSize: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: colors.card,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
  },
  totalValor: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.accent,
  },
  btnFinalizar: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnFinalizarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyArea: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: colors.muted,
    fontWeight: '500',
  },
});
