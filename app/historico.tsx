import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../firebaseConfig';

const { height: altura } = Dimensions.get('window');

const colors = {
  background: '#EDE2CF',
  card: '#FAF4E8',
  textDark: '#3B4A3F',
  accent: '#AC5D21',
  muted: '#A89370',
  border: '#D9C9B0',
};

type HistoricoItem = {
  id: string;
  tipo: 'pedido' | 'reserva';
  titulo: string;
  data: string;
  total?: number;
  status: string;
  detalhes?: string;
};

export default function HistoricoScreen() {
  const [items, setItems] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Busca Pedidos
        const qPedidos = query(
          collection(db, 'pedidos'),
          where('userId', '==', user.uid)
        );
        const snapPedidos = await getDocs(qPedidos);
        const pedidos = snapPedidos.docs.map(doc => ({
          id: doc.id,
          tipo: 'pedido' as const,
          titulo: `Pedido #${doc.id.slice(0, 5)}`,
          data: doc.data().data,
          total: doc.data().total,
          status: doc.data().status,
          detalhes: doc.data().items.map((i: any) => `${i.quantidade}x ${i.nome}`).join(', ')
        }));

        // Busca Reservas
        const qReservas = query(
          collection(db, 'reservas'),
          where('userId', '==', user.uid)
        );
        const snapReservas = await getDocs(qReservas);
        const agora = Date.now();
        const reservas = snapReservas.docs
          .map(doc => ({
            id: doc.id,
            tipo: 'reserva' as const,
            titulo: 'Reserva de Mesa',
            data: doc.data().dataTexto,
            timestamp: doc.data().timestamp,
            status: doc.data().status,
            detalhes: `${doc.data().pessoas} pessoas às ${doc.data().horaTexto}`
          }))
          .filter(r => r.timestamp < agora);

        // Junta e ordena tudo por data (mais recente primeiro)
        const tudo = [...pedidos, ...reservas].sort((a: any, b: any) => {
          const dataA = a.timestamp || new Date(a.data).getTime();
          const dataB = b.timestamp || new Date(b.data).getTime();
          return dataB - dataA;
        });

        setItems(tudo as any);
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, []);

  const renderItem = ({ item }: { item: HistoricoItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.tipoBadge}>
          <Text style={styles.tipoText}>{item.tipo === 'pedido' ? '🛍️ PEDIDO' : '📅 RESERVA'}</Text>
        </View>
        <Text style={styles.dataText}>{new Date(item.data).toLocaleDateString('pt-BR')}</Text>
      </View>
      
      <Text style={styles.tituloCard}>{item.titulo}</Text>
      <Text style={styles.detalhesText}>{item.detalhes}</Text>
      
      {item.total && (
        <Text style={styles.totalText}>Valor Total: R$ {item.total.toFixed(2)}</Text>
      )}
      
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[styles.statusValue, { color: colors.accent }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
          <Feather name="arrow-left" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Histórico</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <View style={styles.emptyArea}>
              <Text style={styles.emptyText}>Você ainda não possui histórico 🌵</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: altura * 0.05,
    paddingBottom: 20,
  },
  btnVoltar: {
    padding: 8,
    marginRight: 12,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textDark,
  },
  lista: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tipoBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tipoText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
  },
  dataText: {
    fontSize: 12,
    color: colors.muted,
  },
  tituloCard: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 4,
  },
  detalhesText: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 8,
  },
  totalText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.muted,
    marginRight: 6,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyArea: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.muted,
  },
});
