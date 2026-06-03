import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../firebaseConfig';

const colors = {
  background: 'rgb(237,226,207)',
  textDark: '#3B4A3F',
  click: '#ac5d21',
  textB: '#efe2d0'
};

const tela = Dimensions.get("window");
const { height: altura } = Dimensions.get('window');

export default function LoginScreen() {
  const[alertaVisivel, setAlertaVisivel] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Controla se a tela está no modo Login (false) ou Cadastro (true)
  const [isCadastro, setIsCadastro] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !senha) return alert('Preencha todos os campos!');

    try {
      setCarregando(true);
      await signInWithEmailAndPassword(auth, email, senha);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      alert('Erro ao logar: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleCadastro = async () => {
    if (!nome || !email || !senha) return alert('Preencha todos os campos!');

    try {
      setCarregando(true);

      // 1. Cria a conta no Firebase Auth
      const credencial = await createUserWithEmailAndPassword(auth, email, senha);
      const usuarioApp = credencial.user;

      // 2. Cria o documento do Perfil no Banco de Dados (Firestore)
      await setDoc(doc(db, "usuarios", usuarioApp.uid), {
        nome: nome,
        nivel: "Semente",
        pontos: 0,
        visitasTotais: 0,
        pratoMaisPedido: "Nenhum ainda"
      });

     setAlertaVisivel(true);
    } catch (error: any) {
      alert('Erro ao cadastrar: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.textDark }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ImageBackground
          source={require('../assets/images/loginBack.jpg')}
          style={[styles.container, { minHeight: tela.height }]}
        >

          {/* MODO CADASTRO: Exibe o campo de Nome dinamicamente */}
          {isCadastro && (
            <View style={styles.caixaInput}>
              <Feather name="edit-3" size={20} color={colors.textDark} />
              <TextInput
                style={styles.inputTexto}
                placeholder='Digite seu Nome'
                autoCapitalize="words"
                value={nome}
                onChangeText={setNome}
              />
            </View>
          )}

          {/* MODO LOGIN E CADASTRO: Exibe E-mail e Senha */}
          <View style={styles.caixaInput}>
            <Feather name="user" size={20} color={colors.textDark} />
            <TextInput
              style={styles.inputTexto}
              placeholder='Digite seu E-mail'
              keyboardType='email-address'
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.caixaInput}>
            <Feather name="lock" size={20} color={colors.textDark} />
            <TextInput
              style={styles.inputTexto}
              placeholder='Digite sua senha'
              secureTextEntry={true}
              autoCapitalize="none"
              value={senha}
              onChangeText={setSenha}
            />
          </View>

          {/* Botão Principal dinâmico (Entrar ou Concluir) */}
          <TouchableOpacity
            style={styles.botao}
            onPress={isCadastro ? handleCadastro : handleLogin}
            disabled={carregando}
          >
            <Text style={styles.boTex}>
              {carregando ? 'AGUARDE...' : (isCadastro ? 'CONCLUIR' : 'ENTRAR')}
            </Text>
          </TouchableOpacity>

          {!isCadastro && <Text style={styles.textlink}>Esqueceu sua senha?</Text>}

          {/* Alternador de Modos (Ir para Cadastro ou Voltar para Login) */}
          <TouchableOpacity onPress={() => setIsCadastro(!isCadastro)}>
            <Text style={styles.textlink}>
              {isCadastro ? 'Já tenho conta. Fazer Login' : 'Criar Nova Conta'}
            </Text>
          </TouchableOpacity>

          <View style={styles.rodape}>
            <Image source={require('../assets/images/final.png')} style={styles.img} />
          </View>
        </ImageBackground>
      </ScrollView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={alertaVisivel}
        onRequestClose={() => setAlertaVisivel(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            
            
            <Feather name="check-circle" size={50} color="#155724"/>
            
            <Text style={styles.modalTitle}>Bem Vindo</Text>
            <Text style={styles.modalText}>Conta criada com sucesso</Text>
            
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => {
                setAlertaVisivel(false); 
                router.replace('/(tabs)/home'); 
              
              }}
            >
              <Text style={styles.modalButtonText}>Entrar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  rodape: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  img: {
    width: 190,
    height: 50,
    marginTop: 80
  },
  container: {
    alignItems: 'center',
    paddingTop: altura * 0.46,
  },
  botao: {
    width: '75%',
    borderWidth: 2,
    padding: 15,
    borderRadius: 8,
    backgroundColor: colors.click,
    borderColor: colors.click,
    marginBottom: 23
  },
  boTex: {
    textAlign: 'center',
    fontSize: 15,
    color: colors.textB,
    fontWeight: 'bold'
  },
  textlink: {
    color: colors.click,
    padding: 4,
    fontWeight: 'bold'
  },
  caixaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '75%',
    borderWidth: 2,
    borderColor: colors.textDark,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  inputTexto: {
    flex: 1,
    paddingVertical: 15,
    marginLeft: 10,
    color: colors.textDark,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: '#C85A17',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
