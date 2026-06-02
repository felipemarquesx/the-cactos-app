import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../../firebaseConfig';
import { useCart } from '../../context/CartContext';
const { width: largura, height: altura } = Dimensions.get('window');


type Produto = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagemUrl: string;
  categoriaId: string;
};

type Categoria = {
  id: string;
  nome: string;
};

// Mesmas cores do seu app
const colors = {
  background: '#EDE2CF',
  card: '#FAF4E8',
  textDark: '#3B4A3F',
  accent: '#AC5D21',
  accentSoft: '#C47A3A',
  textLight: '#EFE2D0',
  muted: '#A89370',
  border: '#D9C9B0',
  star: '#C9A84C',
  navBg: '#FDFAF5',
};

// Mock de Categorias (simplificado para o filtro)
const MOCK_CATEGORIAS: Categoria[] = [
  { id: 'todos', nome: 'Todos' },
  { id: 'carnes', nome: 'Carnes' },
  { id: 'peixes', nome: 'Peixes' },
  { id: 'lanches', nome: 'Lanches' },
  { id: 'bebidas', nome: 'Bebidas' },
  { id: 'sobremesas', nome: 'Sobremesas' },
];

// Mock de Produtos com descrições para o menu
const MOCK_PRODUTOS: Produto[] = [
  {
    id: '1',
    nome: 'Carne de Sol Acebolada',
    descricao: 'Acompanha macaxeira frita, farofa de manteiga de garrafa e vinagrete fresco.',
    preco: 72.0,
    imagemUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=80',
    categoriaId: 'carnes',
  },
  {
    id: '2',
    nome: 'Escondidinho do Cariri',
    descricao: 'Purê de macaxeira cremoso recheado com carne seca desfiada e gratinado com queijo coalho.',
    preco: 58.0,
    imagemUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=300&q=80',
    categoriaId: 'carnes',
  },
  {
    id: '3',
    nome: 'Tapioca de Lagosta',
    descricao: 'Massa fininha recheada com cauda de lagosta na manteiga de ervas e requeijão.',
    preco: 95.0,
    imagemUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&q=80',
    categoriaId: 'peixes',
  },
  {
    id: '4',
    nome: 'Cajuína Gelada',
    descricao: 'Bebida típica nordestina, servida bem gelada. Sem álcool.',
    preco: 12.0,
    imagemUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&q=80',
    categoriaId: 'bebidas',
  },
  {
    id: '5',
    nome: 'Sorvete de Cajú',
    descricao: 'Sorvete artesanal de cajú, com pedaços de fruta e calda de mel.',
    preco: 15.0,
    imagemUrl: 'https://receitadaboa.com.br/wp-content/uploads/2024/08/iStock-1383076817.jpg?w=300&q=80',
    categoriaId: 'sobremesas',
  }
];

export default function CardapioScreen() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>(MOCK_CATEGORIAS);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const { adicionarProduto } = useCart();


  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchDadosFirebase = async () => {
      try {
        setLoading(true);

        // 1. Aponta para a pasta "produtos" no Firebase
        const produtosRef = collection(db, 'produtos');
        // 2. Baixa todos os documentos de lá
        const snapshot = await getDocs(produtosRef);

        // 3. Transforma no formato que a sua FlatList entende
        const produtosFirebase = snapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().nome,
          descricao: doc.data().descricao,
          preco: doc.data().preco,
          imagemUrl: doc.data().imagemUrl,
          categoriaId: doc.data().categoriaId.trim(),
        }));

        if (produtosFirebase.length > 0) {
          setProdutos(produtosFirebase);
        } else {
          // Se o banco estiver vazio, usa os mocks
          setProdutos(MOCK_PRODUTOS);
        }
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        // Fallback em caso de erro
        setProdutos(MOCK_PRODUTOS);
        setLoading(false);
      }
    };



    fetchDadosFirebase();
  }, []);


  const produtosFiltrados = produtos.filter((p) => {
    const matchCategoria = categoriaAtiva === 'todos' || p.categoriaId === categoriaAtiva;
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
    return matchCategoria && matchBusca;
  });


  const renderCategoria = ({ item }: { item: Categoria }) => {
    const isAtiva = categoriaAtiva === item.id;
    return (
      <TouchableOpacity
        style={[styles.categoriaPill, isAtiva && styles.categoriaPillAtiva]}
        onPress={() => setCategoriaAtiva(item.id)}
        activeOpacity={0.8}
      >
        <Text style={[styles.categoriaText, isAtiva && styles.categoriaTextAtiva]}>
          {item.nome}
        </Text>
      </TouchableOpacity>
    );
  };


  const handleAdicionarAoPedido = (produto: Produto) => {
    adicionarProduto(produto);
    alert(`${produto.nome} adicionado ao seu pedido! 🌵`);
  };


  const renderProduto = ({ item }: { item: Produto }) => (
    <TouchableOpacity style={styles.cardProduto} activeOpacity={0.85}>
      <Image
        source={{ uri: item.imagemUrl }}
        style={styles.produtoImagem}
        resizeMode="cover"
      />
      <View style={styles.produtoInfo}>
        <View>
          <Text style={styles.produtoNome} numberOfLines={2}>{item.nome}</Text>
          <Text style={styles.produtoDescricao} numberOfLines={2}>{item.descricao}</Text>
        </View>

        <View style={styles.produtoRodape}>
          <Text style={styles.produtoPreco}>R$ {item.preco.toFixed(2)}</Text>
          <TouchableOpacity style={styles.btnAdd} onPress={() => handleAdicionarAoPedido(item)}>
            <Text style={styles.btnAddText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header Fixo */}
      <View style={styles.header}>
        <Text style={styles.tituloSecao}>Nosso Cardápio</Text>
        <Text style={styles.subTitulo}>Descubra os sabores do sertão ao litoral.</Text>

        <View style={styles.buscaContainer}>
          <Text style={styles.buscaIcone}>🔍</Text>
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar pratos ou bebidas..."
            placeholderTextColor={colors.muted}
            value={busca}
            onChangeText={setBusca}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Filtro de Categorias */}
      <View>
        <FlatList
          data={categorias}
          renderItem={renderCategoria}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listaCategorias}
        />
      </View>

      {/* Lista de Produtos ou Loading */}
      {loading ? (
        <View style={styles.centerArea}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Preparando o cardápio...</Text>
        </View>
      ) : (
        <FlatList
          data={produtosFiltrados}
          renderItem={renderProduto}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaProdutos}
          ListEmptyComponent={
            <View style={styles.centerArea}>
              <Text style={styles.emptyText}>Nenhum prato encontrado com esse nome. 🌵</Text>
            </View>
          }
        />
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
    paddingBottom: 10,
  },
  tituloSecao: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textDark,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subTitulo: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 20,
  },
  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buscaIcone: {
    fontSize: 16,
    marginRight: 8,
  },
  buscaInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
    padding: 0,
  },
  listaCategorias: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  categoriaPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoriaPillAtiva: {
    backgroundColor: colors.textDark,
    borderColor: colors.textDark,
  },
  categoriaText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  categoriaTextAtiva: {
    color: colors.textLight,
  },
  listaProdutos: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardProduto: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  produtoImagem: {
    width: 110,
    height: '100%',
    backgroundColor: colors.border,
  },
  produtoInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
    minHeight: 120, // Garante que o card tenha uma altura boa
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 4,
  },
  produtoDescricao: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  produtoRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  produtoPreco: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
  },
  btnAdd: {
    backgroundColor: colors.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAddText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  loadingText: {
    marginTop: 12,
    color: colors.muted,
    fontWeight: '500',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 16,
  }
});