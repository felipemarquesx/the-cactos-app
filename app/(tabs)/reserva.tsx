import { StyleSheet, Text, View } from 'react-native';
const colors = {
    background: 'rgb(237,226,207)',
    textDark: '#3B4A3F',
    click: '#ac5d21',
    textB: '#efe2d0'
};
export default function HomeScreen() {
    return (
        <View style={styles.container}>

            <Text style={styles.titulo}>Estamos trabalhando aqui 🔨</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.textB,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3B4A3F',
    }
});