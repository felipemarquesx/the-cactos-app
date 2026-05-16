import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

// Nosso mini-dicionário de cores (Vamos deixar aqui por enquanto para facilitar)
const colors = {
  background: '#efe2d0', 
  textDark: '#3B4A3F', 
  click: '#ac5d21', 
  textB: '#efe2d0'
};

export default function HomeScreen() {
  return (
    <ImageBackground 
      source={require('../../assets/images/loginBack.png')}
      style={styles.container}
    >
      
      <Text style={styles.label}>E-mail ou Usuário</Text>    
      <TextInput
        style={styles.inputPadrao}
        placeholder='Digite seu E-mail ou Usuário'
        keyboardType='email-address'
      />

      <Text style={styles.label}>Senha</Text>
      <TextInput 
        style={styles.inputSenha}
        placeholder='Digite sua senha'
        secureTextEntry={true}
        keyboardType='default'
      />

      <TouchableOpacity style={styles.botao}>
        <Text style={styles.boTex}>ENTRAR</Text>
      </TouchableOpacity> 

      <Text style={styles.textlink}>Esqueceu sua senha?</Text>
      <Text style={styles.textlink}>Criar Nova Conta</Text>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  
  container: {
    flex: 1, // Puxando a cor creme
    alignItems: 'center',
    paddingTop: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textDark},
  
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
  label:{
    width: '75%',
    marginBottom: 3,
    textAlign: 'left',
    marginLeft: 20,
  }
  ,
  botao:{
    width: '75%',
    borderWidth: 2,
    padding:15,
    borderRadius: 8,
    backgroundColor: colors.click,
    borderColor: colors.click,
    marginBottom: 6
  }
  ,
  boTex:{
    textAlign: 'center',
    fontSize: 15,
    color: colors.textB
    
  },
  textlink:{
    color: colors.click,
    padding: 4
  }

});
