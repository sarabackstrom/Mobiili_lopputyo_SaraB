import { useState, useEffect } from "react";
import { Button, TextInput, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { getDatabase, ref, push, set, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { Picker } from "@react-native-picker/picker";

export default function Arviointilomake() {
  const [liikuntatunti, setLiikuntatunti] = useState("");
  const [tyoskentely, setTyoskentely] = useState("");
  const [taidot, setTaidot] = useState("");
  const [kommentti, setKommentti] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [liikuntatuntilista, setLiikuntatuntilista] = useState([]);
  const [userLuokka, setUserLuokka] = useState("");
  const database = getDatabase();
  const auth = getAuth();
  const user = auth.currentUser;
  const [valittuTunti, setValittuTunti] = useState("")

  useEffect(() => {
    if (user) {
      const kayttajaRef = ref(database, `kayttajat/${user.uid}`);
      onValue(kayttajaRef, (snapshot) => {
        const kayttajaData = snapshot.val();
        if (kayttajaData && kayttajaData.luokka) {
          setUserLuokka(kayttajaData.luokka);
        } else {
          console.log("Käyttäjältä ei löytynyt luokkaa.");
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (userLuokka) {
      const kayttajatRef = ref(database, "oppitunnit");

      const unsubscribe = onValue(kayttajatRef, (snapshot) => {
        const data = snapshot.val();
        console.log(data);
        if (data) {
          const oppituntiLista = Object.entries(data)
            .filter(([key, oppitunti]) => oppitunti.luokka === userLuokka)
            .map(([key, kayttaja]) => ({ uid: key, ...kayttaja }));
          console.log(oppituntiLista);
          setLiikuntatuntilista(oppituntiLista);
        } else {
          setLiikuntatuntilista([]);
        }
      });

      return () => unsubscribe();
    }
  }, [userLuokka]);

  const handleSubmit = async () => {
    if (user) {
      if (!liikuntatunti || !tyoskentely || !taidot || !kommentti) {
        console.log("Kaikki kentät on täytettävä!");
        return;
      }

      const arviointi = {
        liikuntatunti: valittuTunti,
        tyoskentely,
        taidot,
        kommentti,
      };

      const arviointiRef = ref(database, `kayttajat/${user.uid}/arvioinnit`);
      const newArviointiRef = push(arviointiRef);
      await set(newArviointiRef, arviointi);

      console.log("Arviointi lisätty onnistuneesti käyttäjälle", user.uid);
      setLiikuntatunti("");
      setTyoskentely("");
      setKommentti("");
      setTaidot("");
    } else {
      console.log("Käyttäjä ei ole kirjautunut sisään");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        label="Valitse liikuntatunti"
        value={liikuntatunti ? liikuntatunti : "Valitse oppitunti"}
        mode="outlined"
        style={styles.input}
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
          selectedValue={liikuntatunti}
          onValueChange={(value) => {
            const oppitunti = liikuntatuntilista.find((tunti) => tunti.uid === value);
            setLiikuntatunti(oppitunti ? oppitunti.paivamaara : "");
            setValittuTunti(oppitunti)
            setPickerVisible(false);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Valitse oppitunti" value="" />
          {liikuntatuntilista.map((oppitunti) => (
            <Picker.Item key={oppitunti.uid} label={oppitunti.paivamaara ? `(${oppitunti.paivamaara}) ${oppitunti.aihe}` : oppitunti.paivamaara} value={oppitunti.uid} />
          ))}
        </Picker>
      )}

      <TextInput
        label="Työskentelyn arvosana"
        value={tyoskentely}
        onChangeText={setTyoskentely}
        mode="outlined"
        style={styles.input}
        activeOutlineColor="#3C5556"
      />
      <TextInput
        label="Taitojen arvosana"
        value={taidot}
        onChangeText={setTaidot}
        mode="outlined"
        style={styles.input}
        activeOutlineColor="#3C5556"
      />
      <TextInput
        label="Kommentti"
        value={kommentti}
        onChangeText={setKommentti}
        mode="outlined"
        style={styles.input}
        activeOutlineColor="#3C5556"
      />
      <Button mode="contained" style={styles.button} onPress={handleSubmit}>
        Lisää arviointi
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f6efe7",
    width: "100%"
  },
  input: {
    marginBottom: 10,
    width: "90%",
    marginHorizontal: "5%",
  },
  button: {
    marginBottom: 10,
    width: "90%",
    marginHorizontal: "5%",
    backgroundColor: "#3C5556"
  }
});
