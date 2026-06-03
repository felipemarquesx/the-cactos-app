import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
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
import { auth, db } from '../firebaseConfig';

const { height: altura } = Dimensions.get('window');

const colors = {
  background: '#EDE2CF',
  card: '#FAF4E8',
  textDark: '#3B4A3F',
  accent: '#AC5D21',
  muted: '#A89370',
  border: '#D9C9B0',
  success: '#4A7C59',
};

export default function MeusDadosScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  // ↓ novos estados de endereço
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setEmail(user.email || '');
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setNome(data.nome || '');
            setTelefone(data.telefone || '');

            // ↓ carrega endereço salvo
            setBairro(data.bairro || '');
            setRua(data.rua || '');
            setNumero(data.numero || '');
            setComplemento(data.complemento || '');
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setCarregando(false);
      }
    };
    fetchDados();
  }, []);

  const handleSalvar = async () => {
    if (!nome) return alert('O nome é obrigatório!');

    try {
      setSalvando(true);
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'usuarios', user.uid), {
          nome,
          telefone,
          // ↓ salva endereço no Firestore
          bairro,
          rua,
          numero,
          complemento,
        });
        alert('Dados atualizados com sucesso! 🌵');
        router.back();
      }
    } catch (error) {
      alert('Erro ao salvar: ' + (error as any).message);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
            <Feather name="arrow-left" size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.titulo}>Meus Dados</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.caixaInfo}>

            <Text style={styles.label}>E-mail (Não editável)</Text>
            <View style={[styles.input, styles.inputDesativado]}>
              <Text style={styles.textoDesativado}>{email}</Text>
            </View>

            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(00) 00000-0000"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
            />
          </View>

          {/* ↓ NOVA SEÇÃO: Endereço para entrega */}
          <View style={styles.caixaInfo}>
            <Text style={styles.secaoTitulo}>Endereço</Text>

            <Text style={styles.label}>Rua / Avenida</Text>
            <TextInput
              style={styles.input}
              value={rua}
              onChangeText={setRua}
              placeholder="Ex: Rua das Flores"
              placeholderTextColor={colors.muted}
            />

            {/* Número e Bairro lado a lado */}
            <View style={styles.linha}>
              <View style={styles.metade}>
                <Text style={styles.label}>Número</Text>
                <TextInput
                  style={styles.input}
                  value={numero}
                  onChangeText={setNumero}
                  placeholder="Ex: 123"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.metade}>
                <Text style={styles.label}>Bairro</Text>
                <TextInput
                  style={styles.input}
                  value={bairro}
                  onChangeText={setBairro}
                  placeholder="Ex: Centro"
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>

            <Text style={styles.label}>Complemento (opcional)</Text>
            <TextInput
              style={styles.input}
              value={complemento}
              onChangeText={setComplemento}
              placeholder="Ex: Apto 12, Casa dos fundos"
              placeholderTextColor={colors.muted}
            />
          </View>

          <TouchableOpacity
            style={[styles.btnSalvar, salvando && { opacity: 0.7 }]}
            onPress={handleSalvar}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnSalvarText}>SALVAR ALTERAÇÕES</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: altura * 0.05, paddingBottom: 20,
  },
  btnVoltar: { padding: 8, marginRight: 12 },
  titulo: { fontSize: 24, fontWeight: '800', color: colors.textDark },
  container: { padding: 20 },
  caixaInfo: {
    backgroundColor: colors.card, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 20,
  },
  // ↓ novo estilo: título da seção de endereço
  secaoTitulo: {
    fontSize: 16, fontWeight: '800', color: colors.accent, marginBottom: 4,
  },
  label: {
    fontSize: 14, fontWeight: '700', color: colors.textDark,
    marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: colors.background, borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: colors.border, color: colors.textDark, fontSize: 16,
  },
  inputDesativado: { backgroundColor: '#EAEAEA', borderColor: '#CCC' },
  textoDesativado: { color: '#888' },
  // ↓ novos estilos: linha com dois campos lado a lado
  linha: { flexDirection: 'row', gap: 12 },
  metade: { flex: 1 },
  btnSalvar: {
    backgroundColor: colors.accent, paddingVertical: 18, borderRadius: 12,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1,
    shadowRadius: 5, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  btnSalvarText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});