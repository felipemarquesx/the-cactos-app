import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: largura, height: altura } = Dimensions.get('window');


type Reserva = {
    id: string;
    dataTexto: string;
    horaTexto: string;
    pessoas: number;
    status: 'confirmada' | 'pendente';
    timestamp: number;
};

// Paleta de cores do app
const colors = {
    background: '#EDE2CF',
    card: '#FAF4E8',
    textDark: '#3B4A3F',
    accent: '#AC5D21',
    accentSoft: '#C47A3A',
    textLight: '#EFE2D0',
    muted: '#A89370',
    border: '#D9C9B0',
    success: '#4A7C59',
    warning: '#D68C45',
};


const dataAtual = Date.now();
const umDiaEmMs = 86400000;

const MOCK_RESERVAS: Reserva[] = [
    {
        id: '1',
        dataTexto: '28 de Maio, 2026',
        horaTexto: '20:00',
        pessoas: 2,
        status: 'confirmada',
        timestamp: dataAtual + umDiaEmMs, // Futuro
    },
    {
        id: '2',
        dataTexto: '05 de Junho, 2026',
        horaTexto: '19:30',
        pessoas: 4,
        status: 'pendente',
        timestamp: dataAtual + (umDiaEmMs * 8), // Futuro
    },
    {
        id: '3',
        dataTexto: '10 de Abril, 2026',
        horaTexto: '21:00',
        pessoas: 3,
        status: 'confirmada',
        timestamp: dataAtual - (umDiaEmMs * 45),
    },
];

export default function ReservasScreen() {
    const [reservasAtivas, setReservasAtivas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(true);

    // Simulação de busca no Firebase
    useEffect(() => {
        const fetchReservas = async () => {
            try {
                setLoading(true);


                setTimeout(() => {

                    const agora = Date.now();
                    const ativas = MOCK_RESERVAS.filter(reserva => reserva.timestamp >= agora);


                    ativas.sort((a, b) => a.timestamp - b.timestamp);

                    setReservasAtivas(ativas);
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Erro ao buscar reservas:", error);
                setLoading(false);
            }
        };

        fetchReservas();
    }, []);

    // Componente do Card de "Nova Reserva" (Fica no topo da lista)
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.tituloSecao}>Suas Reservas</Text>
            <Text style={styles.subTitulo}>Garanta sua mesa e evite filas.</Text>

            <TouchableOpacity style={styles.btnNovaReserva} activeOpacity={0.7}>
                <View style={styles.iconPlusContainer}>
                    <Text style={styles.iconPlus}>+</Text>
                </View>
                <Text style={styles.textoNovaReserva}>Fazer Nova Reserva</Text>
            </TouchableOpacity>

            {reservasAtivas.length > 0 && (
                <Text style={styles.secaoDivider}>Próximas Visitas</Text>
            )}
        </View>
    );

    const renderReserva = ({ item }: { item: Reserva }) => {
        const isConfirmada = item.status === 'confirmada';

        return (
            <View style={styles.cardReserva}>
                <View style={styles.cardTopo}>
                    <View style={styles.dataArea}>
                        <Text style={styles.dataIcone}>📅</Text>
                        <View>
                            <Text style={styles.dataTexto}>{item.dataTexto}</Text>
                            <Text style={styles.horaTexto}>{item.horaTexto}</Text>
                        </View>
                    </View>

                    <View style={[
                        styles.badgeStatus,
                        { backgroundColor: isConfirmada ? colors.success + '20' : colors.warning + '20' }
                    ]}>
                        <Text style={[
                            styles.textoStatus,
                            { color: isConfirmada ? colors.success : colors.warning }
                        ]}>
                            {isConfirmada ? 'Confirmada' : 'Pendente'}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardRodape}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcone}>👥</Text>
                        <Text style={styles.infoTexto}>{item.pessoas} {item.pessoas === 1 ? 'Pessoa' : 'Pessoas'}</Text>
                    </View>

                    <TouchableOpacity style={styles.btnDetalhes}>
                        <Text style={styles.btnDetalhesTexto}>Ver Detalhes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {loading ? (
                <View style={styles.centerArea}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={styles.loadingText}>Buscando suas reservas...</Text>
                </View>
            ) : (
                <FlatList
                    data={reservasAtivas}
                    renderItem={renderReserva}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listaContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyArea}>
                            <Text style={styles.emptyIcon}>🍽️</Text>
                            <Text style={styles.emptyTitle}>Nenhuma reserva ativa</Text>
                            <Text style={styles.emptyText}>Você não tem mesas reservadas para os próximos dias.</Text>
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
    listaContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: altura * 0.05,
    },
    headerContainer: {
        marginBottom: 16,
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
        marginBottom: 24,
    },
    btnNovaReserva: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: colors.accentSoft,
        borderStyle: 'dashed', // Dá aquele aspecto visual de "Adicionar"
        marginBottom: 32,
    },
    iconPlusContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    iconPlus: {
        fontSize: 24,
        color: '#FFF',
        fontWeight: '600',
        lineHeight: 28,
    },
    textoNovaReserva: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textDark,
    },
    secaoDivider: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textDark,
        marginBottom: 16,
    },
    cardReserva: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    cardTopo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 16,
    },
    dataArea: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dataIcone: {
        fontSize: 24,
        marginRight: 12,
    },
    dataTexto: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textDark,
        marginBottom: 2,
    },
    horaTexto: {
        fontSize: 14,
        color: colors.muted,
        fontWeight: '500',
    },
    badgeStatus: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    textoStatus: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    cardRodape: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcone: {
        fontSize: 16,
        marginRight: 8,
    },
    infoTexto: {
        fontSize: 14,
        color: colors.textDark,
        fontWeight: '600',
    },
    btnDetalhes: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: colors.background,
    },
    btnDetalhesTexto: {
        fontSize: 13,
        color: colors.accent,
        fontWeight: '700',
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
    emptyArea: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textDark,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: colors.muted,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    }
});