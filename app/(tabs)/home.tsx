import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Importações do Firebase
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const { width: largura, height: altura } = Dimensions.get('window');

type Destaque = {
  id: string;
  nome: string;
  preco: number;
  avaliacao: number;
  imagemUrl: string;
  categoria: string;
};

type Categoria = {
  id: string;
  nome: string;
  icone: string;
  ordem: number;
};

type Unidade = {
  id: string;
  nome: string;
  endereco: string;
};

const MOCK_DESTAQUES: Destaque[] = [
  {
    id: '1',
    nome: 'Carne de Sol Acebolada',
    preco: 72.0,
    avaliacao: 4.8,
    imagemUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=80',
    categoria: 'carnes',
  },
  {
    id: '2',
    nome: 'Escondidinho do Cariri',
    preco: 58.0,
    avaliacao: 4.9,
    imagemUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=300&q=80',
    categoria: 'carnes',
  },
  {
    id: '3',
    nome: 'Tapioca de Lagosta',
    preco: 95.0,
    avaliacao: 5.0,
    imagemUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&q=80',
    categoria: 'peixes',
  },
  {
    id: '4',
    nome: 'Tapioca Avurá',
    preco: 35.0,
    avaliacao: 4.7,
    imagemUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&q=80',
    categoria: 'lanches',
  },
];

const MOCK_CATEGORIAS: Categoria[] = [
  { id: 'carnes', nome: 'Carnes', icone: 'food-steak', ordem: 1 },
  { id: 'peixes', nome: 'Peixes', icone: 'fish', ordem: 2 },
  { id: 'vegetariano', nome: 'Vegetariano', icone: 'leaf', ordem: 3 },
  { id: 'bebidas', nome: 'Bebidas', icone: 'glass-cocktail', ordem: 4 },
  { id: 'sobremesas', nome: 'Sobremesas', icone: 'cupcake', ordem: 5 },
  { id: 'lanches', nome: 'Lanches', icone: 'hamburger', ordem: 6 },
];

const MOCK_UNIDADES: Unidade[] = [
  { id: '1', nome: 'The Cactos — Centro', endereco: 'Rua Abnerado, 103' },
];

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

export default function HomeScreen() {
  const [destaques, setDestaques] = useState<Destaque[]>(MOCK_DESTAQUES);
  const [categorias, setCategorias] = useState<Categoria[]>(MOCK_CATEGORIAS);
  const [unidades, setUnidades] = useState<Unidade[]>(MOCK_UNIDADES);
  const [busca, setBusca] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const [scrollIndex, setScrollIndex] = useState(0);

  // Estado para guardar o nome real do usuário
  const [nomeUsuarioReal, setNomeUsuarioReal] = useState('Visitante');

  const router = useRouter();

  // useEffect que busca o nome assim que a tela abre
  useEffect(() => {
    const fetchNomeUsuario = async () => {
      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          const userDocRef = doc(db, 'usuarios', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data().nome) {
            // Se achar o nome no banco de dados, atualiza a tela
            setNomeUsuarioReal(userDoc.data().nome);
          } else if (currentUser.displayName) {
            // Plano B: Pega o nome do próprio e-mail cadastrado (se houver)
            setNomeUsuarioReal(currentUser.displayName);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar nome para a Home:", error);
      }
    };

    fetchNomeUsuario();
  }, []);

  // useEffect para buscar produtos e calcular os Destaques baseados na Média
  useEffect(() => {
    const fetchDestaques = async () => {
      try {
        const produtosRef = collection(db, 'produtos');
        const snapshot = await getDocs(produtosRef);

        const produtosFirebase = snapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().nome,
          preco: doc.data().preco,
          imagemUrl: doc.data().imagemUrl,
          categoriaId: doc.data().categoriaId?.trim(),
        }));

        if (produtosFirebase.length > 0) {
          // Agrupar produtos por categoria
          const byCategory: Record<string, typeof produtosFirebase> = {};
          produtosFirebase.forEach(p => {
            if (!p.categoriaId) return;
            if (!byCategory[p.categoriaId]) byCategory[p.categoriaId] = [];
            byCategory[p.categoriaId].push(p);
          });

          const novosDestaques: Destaque[] = [];

          // Pegar o valor médio de cada categoria e escolher o prato mais próximo
          for (const cat in byCategory) {
            const pratos = byCategory[cat];
            const totalPreco = pratos.reduce((acc, p) => acc + (p.preco || 0), 0);
            const media = totalPreco / pratos.length;

            // Encontrar o prato com valor mais próximo da média
            let closest = pratos[0];
            let minDiff = Math.abs((pratos[0].preco || 0) - media);

            for (let i = 1; i < pratos.length; i++) {
              const diff = Math.abs((pratos[i].preco || 0) - media);
              if (diff < minDiff) {
                minDiff = diff;
                closest = pratos[i];
              }
            }

            novosDestaques.push({
              id: closest.id,
              nome: closest.nome,
              preco: closest.preco,
              avaliacao: 4.8, // Valor fixo já que não existe no BD ainda
              imagemUrl: closest.imagemUrl,
              categoria: closest.categoriaId,
            });
          }

          if (novosDestaques.length > 0) {
            setDestaques(novosDestaques);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar destaques:", error);
      }
    };

    fetchDestaques();
  }, []);

  const ITEM_WIDTH = 162; // 150 de largura do card + 12 de marginRight

  const handleScroll = (direction: 'left' | 'right') => {
    if (!flatListRef.current) return;
    const maxIndex = destaquesFiltrados.length - 1;
    let newIndex = direction === 'left' ? scrollIndex - 1 : scrollIndex + 1;

    if (newIndex < 0) newIndex = 0;
    if (newIndex > maxIndex) newIndex = maxIndex;

    setScrollIndex(newIndex);
    flatListRef.current.scrollToIndex({ index: newIndex, animated: true });
  };

  const destaquesFiltrados = busca
    ? destaques.filter((d: Destaque) => d.nome.toLowerCase().includes(busca.toLowerCase()))
    : destaques;

  const renderDestaque = ({ item }: { item: Destaque }) => (
    <TouchableOpacity style={styles.cardDestaque} activeOpacity={0.85}>
      <Image
        source={{ uri: item.imagemUrl }}
        style={styles.cardImagem}
        resizeMode="cover"
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardNome} numberOfLines={2}>{item.nome}</Text>
        <View style={styles.cardRodape}>
          <Text style={styles.cardPreco}>R$ {item.preco.toFixed(2)}</Text>
          <View style={styles.cardAvaliacaoRow}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.cardAvaliacao}>{item.avaliacao.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.saudacaoArea}>
          <Text style={styles.saudacaoTexto}>
            Olá, <Text style={styles.saudacaoNome}>{nomeUsuarioReal}</Text>!{'\n'}
            Que tal um sabor autêntico do Nordeste hoje?
          </Text>
        </View>

        <View style={styles.buscaContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.muted} style={styles.buscaIcone} />
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar pratos ou ingredientes..."
            placeholderTextColor={colors.muted}
            value={busca}
            onChangeText={setBusca}
            returnKeyType="search"
          />
        </View>

        <View style={styles.secaoHeader}>
          <View style={styles.secaoTituloRow}>
            <View style={styles.destaqueLetter}>
              <Text style={styles.destaqueLetterText}>D</Text>
            </View>
            <Text style={styles.secaoTitulo}> destaques do Dia</Text>
          </View>
          <View style={styles.navButtons}>
            <TouchableOpacity style={[styles.navBtn, { marginRight: 6 }]} onPress={() => handleScroll('left')}>
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={() => handleScroll('right')}>
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={destaquesFiltrados}
          renderItem={renderDestaque}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listaDestaques}
          scrollEnabled={true}
          onMomentumScrollEnd={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            setScrollIndex(Math.round(offsetX / ITEM_WIDTH));
          }}
          getItemLayout={(data, index) => (
            { length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index }
          )}
        />

        <View style={styles.categoriasGrid}>
          {categorias.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoriaItem}
              activeOpacity={0.75}
              onPress={() => router.push({ pathname: '/(tabs)/cardapio', params: { categoria: cat.id } })}
            >
              <MaterialCommunityIcons
                name={cat.icone as any}
                size={28}
                color={colors.accent}
                style={styles.categoriaIcone}
              />
              <Text style={styles.categoriaNome}>{cat.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.unidadesArea}>
          <Text style={styles.secaoTituloSimples}>Nossas Unidades</Text>
          {unidades.map(u => (
            <TouchableOpacity key={u.id} style={styles.unidadeCard} activeOpacity={0.85}>
              <View style={styles.mapPlaceholder}>
                <MaterialCommunityIcons name="map-marker-outline" size={32} color={colors.textDark} />
              </View>
              <View style={styles.unidadeInfo}>
                <Text style={styles.unidadeNome}>{u.nome}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="map-marker" size={14} color={colors.muted} style={{ marginRight: 4 }} />
                  <Text style={styles.unidadeEndereco}>{u.endereco}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  logoArea: {
    alignItems: 'center',
    paddingTop: '8%',
    paddingBottom: 8,
  },
  logoIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.textDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoIcone: {
    fontSize: 32,
  },
  logoNome: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 6,
    color: colors.textDark,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  logoDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  logoDivider: {
    width: 32,
    height: 1,
    backgroundColor: colors.muted,
  },
  logoSub: {
    fontSize: 10,
    letterSpacing: 3,
    color: colors.muted,
    marginHorizontal: 8,
  },
  logoTagline: {
    fontSize: 9,
    letterSpacing: 2,
    color: colors.muted,
    marginTop: 2,
  },
  saudacaoArea: {
    paddingTop: altura * 0.06,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  saudacaoTexto: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textDark,
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  saudacaoNome: {
    color: colors.accent,
  },
  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
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
  secaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  secaoTituloRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destaqueLetter: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.textDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destaqueLetterText: {
    color: colors.textLight,
    fontWeight: '900',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginLeft: 6,
  },
  secaoTituloSimples: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 12,
  },
  navButtons: {
    flexDirection: 'row',
  },
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  navBtnText: {
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 20,
  },
  listaDestaques: {
    paddingLeft: 20,
    paddingRight: 8,
    paddingBottom: 8,
  },
  cardDestaque: {
    width: 150,
    marginRight: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardImagem: {
    width: '100%',
    height: 110,
    backgroundColor: colors.border,
  },
  cardBody: {
    padding: 10,
  },
  cardNome: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDark,
    lineHeight: 18,
    marginBottom: 6,
    minHeight: 36,
  },
  cardRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPreco: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  cardAvaliacaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: colors.star,
    fontSize: 12,
    marginRight: 4,
  },
  cardAvaliacao: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  categoriasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  categoriaItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  categoriaIcone: {
    fontSize: 28,
    marginBottom: 4,
  },
  categoriaNome: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
  },
  unidadesArea: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  unidadeCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  mapPlaceholder: {
    width: 90,
    height: 72,
    backgroundColor: '#C9DDD0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapEmoji: {
    fontSize: 32,
  },
  unidadeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  unidadeNome: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 4,
  },
  unidadeEndereco: {
    fontSize: 12,
    color: colors.muted,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 8,
  },
  footerIcone: {
    fontSize: 24,
    marginBottom: 4,
  },
  footerMarca: {
    fontSize: 10,
    letterSpacing: 3,
    color: colors.muted,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerCopy: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
});