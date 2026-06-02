import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../../firebaseConfig';

const { width: largura, height: altura } = Dimensions.get('window');


type PerfilUsuario = {
    uid: string;
    nome: string;
    email: string;
    fotoUrl: string | null;
    nivel: string;
    pontos: number;
    proximoNivelPontos: number;
    pratoMaisPedido: string;
    visitasTotais: number;
};


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
    danger: '#D9534F',
};

const AVATARES_DISPONIVEIS = [
    'https://api.dicebear.com/7.x/avataaars/png?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Mimi',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Jack',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Jude',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Coco',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Oliver',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Jasper',
];

export default function PerfilScreen() {
    const [userData, setUserData] = useState<PerfilUsuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalAvatarVisivel, setModalAvatarVisivel] = useState(false);
    const router = useRouter();


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const currentUser = auth.currentUser;

                if (currentUser) {

                    const userDocRef = doc(db, 'usuarios', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserData({
                            uid: currentUser.uid,
                            email: currentUser.email || '',
                            nome: data.nome || 'Cliente Cactos',
                            fotoUrl: data.fotoUrl || null,
                            nivel: data.nivel || 'Cacto Bronze',
                            pontos: data.pontos || 0,
                            proximoNivelPontos: 2000,
                            pratoMaisPedido: data.pratoMaisPedido || 'Nenhum ainda',
                            visitasTotais: data.visitasTotais || 0,
                        });
                    } else {

                        setUserData({
                            uid: currentUser.uid,
                            email: currentUser.email || '',
                            nome: 'Novo Cliente',
                            fotoUrl: null,
                            nivel: 'Semente',
                            pontos: 0,
                            proximoNivelPontos: 1000,
                            pratoMaisPedido: 'Nenhum',
                            visitasTotais: 0,
                        });
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error("Erro ao carregar perfil:", error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);


    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace('/');
        } catch (error) {
            console.error("Erro ao deslogar:", error);
        }
    };

    const handleSelecionarAvatar = async (url: string) => {
        try {
            const currentUser = auth.currentUser;
            if (currentUser && userData) {
                const userDocRef = doc(db, 'usuarios', currentUser.uid);
                await updateDoc(userDocRef, {
                    fotoUrl: url
                });
                setUserData({ ...userData, fotoUrl: url });
                setModalAvatarVisivel(false);
            }
        } catch (error) {
            console.error("Erro ao atualizar avatar:", error);
            alert("Erro ao salvar o avatar. Tente novamente.");
        }
    };


    const progressoFidelidade = userData
        ? (userData.pontos / userData.proximoNivelPontos) * 100
        : 0;

    // Tela de Carregamento
    if (loading || !userData) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centerArea}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={styles.loadingText}>Carregando seu perfil...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={() => setModalAvatarVisivel(true)}
                        activeOpacity={0.8}
                    >
                        {userData.fotoUrl ? (
                            <Image source={{ uri: userData.fotoUrl }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <MaterialCommunityIcons name="account" size={48} color={colors.muted} />
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.nomeUsuario}>{userData.nome}</Text>
                    <Text style={styles.emailUsuario}>{userData.email}</Text>
                </View>


                <View style={styles.fidelidadeCard}>
                    <View style={styles.fidelidadeHeader}>
                        <View>
                            <Text style={styles.fidelidadeTitulo}>Programa Cactos</Text>
                            <Text style={styles.nivelTexto}>{userData.nivel}</Text>
                        </View>
                        <MaterialCommunityIcons name="trophy" size={32} color={colors.star} />
                    </View>

                    <View style={styles.barraFundo}>
                        <View style={[styles.barraProgresso, { width: `${progressoFidelidade}%` }]} />
                    </View>

                    <View style={styles.pontosContainer}>
                        <Text style={styles.pontosTexto}>{userData.pontos} pts</Text>
                        <Text style={styles.pontosTextoFaltam}>Faltam {userData.proximoNivelPontos - userData.pontos} pts para o próximo nível</Text>
                    </View>
                </View>


                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <MaterialCommunityIcons name="silverware-variant" size={24} color={colors.accent} style={{ marginBottom: 8 }} />
                        <Text style={styles.statTitulo}>Mais Pedido</Text>
                        <Text style={styles.statValor} numberOfLines={1}>{userData.pratoMaisPedido}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <MaterialCommunityIcons name="calendar-check" size={24} color={colors.accent} style={{ marginBottom: 8 }} />
                        <Text style={styles.statTitulo}>Visitas Totais</Text>
                        <Text style={styles.statValor}>{userData.visitasTotais}</Text>
                    </View>
                </View>


                <View style={styles.menuContainer}>
                    <Text style={styles.menuTitulo}>Minha Conta</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/meus-dados')}>
                        <View style={styles.menuItemLeft}>
                            <MaterialCommunityIcons name="cog" size={20} color={colors.textDark} style={styles.menuIcone} />
                            <Text style={styles.menuTexto}>Meus Dados</Text>
                        </View>
                        <Text style={styles.menuSeta}>›</Text>
                    </TouchableOpacity>


                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/historico')}>
                        <View style={styles.menuItemLeft}>
                            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.textDark} style={styles.menuIcone} />
                            <Text style={styles.menuTexto}>Histórico de Visitas e Reservas</Text>
                        </View>
                        <Text style={styles.menuSeta}>›</Text>
                    </TouchableOpacity>


                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <MaterialCommunityIcons name="credit-card-outline" size={20} color={colors.textDark} style={styles.menuIcone} />
                            <Text style={styles.menuTexto}>Métodos de Pagamento</Text>
                        </View>
                        <Text style={styles.menuSeta}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <MaterialCommunityIcons name="ticket-percent-outline" size={20} color={colors.textDark} style={styles.menuIcone} />
                            <Text style={styles.menuTexto}>Meus Cupons</Text>
                        </View>
                        <Text style={styles.menuSeta}>›</Text>
                    </TouchableOpacity>
                </View>


                <TouchableOpacity style={styles.btnSair} onPress={handleLogout}>
                    <Text style={styles.btnSairTexto}>Sair da Conta</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Modal de Escolha de Avatar */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalAvatarVisivel}
                onRequestClose={() => setModalAvatarVisivel(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitulo}>Escolha um Ícone</Text>

                        <View style={styles.gridAvatares}>
                            {AVATARES_DISPONIVEIS.map((url, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.avatarOpcao}
                                    onPress={() => handleSelecionarAvatar(url)}
                                >
                                    <Image source={{ uri: url }} style={styles.avatarImagemOpcao} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.btnFecharModal}
                            onPress={() => setModalAvatarVisivel(false)}
                        >
                            <Text style={styles.btnFecharTexto}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: colors.muted,
        fontWeight: '500',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        paddingTop: altura * 0.059,
        paddingBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: colors.card,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    modalTitulo: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.textDark,
        marginBottom: 20,
    },
    gridAvatares: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 24,
    },
    avatarOpcao: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: colors.border,
        overflow: 'hidden',
        backgroundColor: colors.background,
        margin: 8,
    },
    avatarImagemOpcao: {
        width: '100%',
        height: '100%',
    },
    btnFecharModal: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    btnFecharTexto: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.muted,
    },
    nomeUsuario: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.textDark,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    emailUsuario: {
        fontSize: 14,
        color: colors.muted,
        marginTop: 4,
    },
    fidelidadeCard: {
        marginHorizontal: 20,
        backgroundColor: colors.textDark,
        borderRadius: 16,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
    },
    fidelidadeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    fidelidadeTitulo: {
        fontSize: 12,
        color: colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    nivelTexto: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.star,
    },
    iconeNivel: {
        fontSize: 32,
    },
    barraFundo: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    barraProgresso: {
        height: '100%',
        backgroundColor: colors.star,
        borderRadius: 4,
    },
    pontosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pontosTexto: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    pontosTextoFaltam: {
        fontSize: 12,
        color: colors.muted,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 20,
        justifyContent: 'space-between',
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    statIcone: {
        fontSize: 24,
        marginBottom: 8,
    },
    statTitulo: {
        fontSize: 12,
        color: colors.muted,
        marginBottom: 4,
    },
    statValor: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textDark,
        textAlign: 'center',
    },
    menuContainer: {
        marginTop: 32,
        paddingHorizontal: 20,
    },
    menuTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textDark,
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcone: {
        fontSize: 20,
        marginRight: 12,
    },
    menuTexto: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textDark,
    },
    menuSeta: {
        fontSize: 20,
        color: colors.muted,
    },
    btnSair: {
        marginTop: 32,
        marginHorizontal: 20,
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.danger + '40',
        alignItems: 'center',
    },
    btnSairTexto: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.danger,
    }
});