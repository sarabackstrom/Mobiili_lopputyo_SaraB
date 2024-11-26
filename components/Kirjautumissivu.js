import { useState } from "react";
import { SafeAreaView, StyleSheet, Alert, TouchableOpacity, Text } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";

import { handleSignIn, handleSignUp } from "./Authentication";

import { getDatabase, ref, set } from "firebase/database";
import { app } from "./Authentication";

import { Luokat } from "./Luokat";

export default function Kirjautumisivu({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uusiemail, setuusiEmail] = useState("");
  const [uusipassword, setuusiPassword] = useState("");
  const [kayttajatunnus, setKayttajatunnus] = useState("");
  const [luokka, setLuokka] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const database = getDatabase(app);

  const toggleText = () => {
    setIsVisible(!isVisible);
  };

  const [pickerVisible, setPickerVisible] = useState(false);

  const handleRegister = async () => {
    try {
      const userCredential = await handleSignUp(uusiemail, uusipassword);
      const user = userCredential.user;

      await set(ref(database, "kayttajat/" + user.uid), {
        uid: user.uid,
        email: user.email,
        kayttajanimi: kayttajatunnus,
        luokka: luokka,
        arvioinnit: []
      });

      console.log("Käyttäjä tallennettu tietokantaan",

        setKayttajatunnus(""),
        setuusiEmail(""),
        setLuokka(""),
        setuusiPassword("")

      );

      Alert.alert(
        "Tunnus luotu",
        `Tunnus ${kayttajatunnus} luotu sähköpostille ${uusiemail}.`,
        [
          {
            text: "OK",
            onPress: () => console.log("Alert OK pressed"),
          },
        ]
      );
    } catch (error) {
      console.error("Error during sign-up:", error.message);
      Alert.alert("Virhe", error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await handleSignIn(email, password);
      onLogin();
    } catch (error) {
      console.error("Error during login:", error.message);
      Alert.alert("Virhe kirjautumisessa", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={[styles.input, { marginTop: 20 }]}
        activeOutlineColor="#3C5556"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
        activeOutlineColor="#3C5556"
      />
      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Kirjaudu sisään
      </Button>

      {/* Tästä alkaa lisätty osuus */}
      <Button icon="information" onPress={toggleText} labelStyle={{ color: "#3C5556" }}>
        Paina tästä luodaksesi uuden käyttäjän
      </Button>
      {isVisible && (
        <>
          <TextInput
            label="Käyttäjätunnus (Etu- ja Sukunimi)"
            value={kayttajatunnus}
            onChangeText={setKayttajatunnus}
            mode="outlined"
            style={styles.input}
            activeOutlineColor="#3C5556"
          />
          <TextInput
            label="Email"
            value={uusiemail}
            onChangeText={setuusiEmail}
            mode="outlined"
            style={styles.input}
            activeOutlineColor="#3C5556"
          />
          <TextInput
            label="Luokka"
            value={luokka}
            onChangeText={setLuokka}
            mode="outlined"
            style={styles.input}
            activeOutlineColor="#3C5556"
            right={
              <TextInput.Icon
                icon="chevron-down"
                onPress={() => setPickerVisible(!pickerVisible)}
              />
            }
            editable={false}
          />
          {pickerVisible && (
            <Picker
              selectedValue={luokka}
              onValueChange={(itemValue) => setLuokka(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Valitse luokka" value="" />
              {Luokat.map((luokkaItem, index) => (
                <Picker.Item key={index} label={luokkaItem} value={luokkaItem} />
              ))}
            </Picker>
          )}
          <TextInput
            label="Password"
            value={uusipassword}
            onChangeText={setuusiPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            activeOutlineColor="#3C5556"
          />

          <Button mode="contained" onPress={handleRegister} style={styles.button}>
            Luo tunnus
          </Button></>)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5eeff",
    width: "100%",
    backgroundColor: "#f6efe7"
  },
  input: {
    marginBottom: 10,
    width: "90%",
    marginStart: "5%"
  },
  button: {
    marginBottom: 10,
    backgroundColor: "#3C5556",
    width: "90%",
    marginStart: "5%"
  },
  button2: {
    color: "#3C5556"
  }
});



