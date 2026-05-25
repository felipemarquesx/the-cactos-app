import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const colors = {
  background: 'rgb(237,226,207)',
  textDark: '#3B4A3F',
  click: '#ac5d21',
  textB: '#efe2d0'
};

const tela = Dimensions.get("window");
const { height: altura } = Dimensions.get('window');


export default function LoginScreen() {
  return (
    <ScrollView style={{ backgroundColor: colors.textDark }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={require('../assets/images/loginBack.jpg')}
        style={[styles.container, { minHeight: tela.height }]}
      >


        <View style={styles.caixaInput}>
          <Feather name="user" size={20} color={colors.textDark} />
          <TextInput
            style={styles.inputTexto}
            placeholder='Digite seu E-mail ou Usuário'
            keyboardType='email-address'
            autoCapitalize="none"
          />
        </View>

        <View style={styles.caixaInput}>
          <Feather name="lock" size={20} color={colors.textDark} />
          <TextInput
            style={styles.inputTexto}
            placeholder='Digite sua senha'
            secureTextEntry={true}
            keyboardType='default'
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.botao} onPress={() => router.push('/(tabs)/home')}>
          <Text style={styles.boTex}>ENTRAR</Text>
        </TouchableOpacity>

        <Text style={styles.textlink}>Esqueceu sua senha?</Text>
        <Text style={styles.textlink}>Criar Nova Conta</Text>
        <View style={styles.rodape}><Image source={require('../assets/images/final.png')} style={styles.img} /></View>
      </ImageBackground>
    </ScrollView>
  )
};

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

  inputPadrao: {
    width: '75%',
    borderWidth: 2,
    borderColor: colors.textDark,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  inputSenha: {
    width: '75%',
    borderWidth: 2,
    borderColor: colors.textDark,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  label: {
    width: '75%',
    marginBottom: 3,
    textAlign: 'left',
    marginLeft: '5%',
    color: colors.click

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
    color: colors.textB
  },
  textlink: {
    color: colors.click,
    padding: 4,

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
});