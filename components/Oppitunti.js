import { useState, useEffect } from "react";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { getDatabase, ref, set, onValue, push } from "firebase/database";
import { getAuth } from "firebase/auth";
import { Picker } from "@react-native-picker/picker";
import { Luokat } from "./Luokat";
import DateTimePicker from "@react-native-community/datetimepicker";


export default function Oppitunti() {
  const database = getDatabase();
  const [luokka, setLuokka] = useState("");
  const [paivamaara, setPaivamaara] = useState(new Date());
  const [aihe, setAihe] = useState("");
  const [kommentti, setKommentti] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [oppilaat, setOppilaat] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const kayttajatRef = ref(database, "kayttajat");

    const unsubscribe = onValue(kayttajatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const oppilasLista = Object.entries(data)
          .filter(([key, kayttaja]) => kayttaja.luokka && kayttaja.luokka !== "opettaja")
          .map(([key, kayttaja]) => ({ uid: key, ...kayttaja }));
        setOppilaat(oppilasLista);
      } else {
        setOppilaat([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0]; // Muutetaan ISO-muotoon
      setPaivamaara(formattedDate);
    }
  };


  const handleSubmit = async () => {
    if (!luokka || !paivamaara || !aihe || !kommentti) {
      console.log("Kaikki kentät on täytettävä!");
      return;
    }

    const [year, month, day] = paivamaara.split("-");
    const muokattuPvm = `${day}.${month}.${year}`;

    const user = getAuth().currentUser;
    if (user) {
      try {
        const oppituntiRef = ref(database, "oppitunnit");
        const newOppituntiRef = push(oppituntiRef);
        const oppituntiUid = newOppituntiRef.key;

        await set(newOppituntiRef, {
          luokka: luokka,
          paivamaara: muokattuPvm,
          aihe: aihe,
          kommentti: kommentti,
          oppituntiUid: oppituntiUid,
          opettajaUid: user.uid,
        });

        console.log("Oppitunti lisätty tietokantaan");

        setAihe("");
        setKommentti("");
        setLuokka("");
        setPaivamaara(new Date().toISOString().split("T")[0]);
      } catch (error) {
        console.error("Virhe tallennuksessa:", error);
      }
    } else {
      console.log("Käyttäjä ei ole kirjautunut sisään");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
        label="Aihe"
        value={aihe}
        onChangeText={setAihe}
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
      <TextInput
        label="Päivämäärä"
        value={paivamaara}
        mode="outlined"
        style={styles.input}
        onFocus={() => setShowDatePicker(true)}
        showSoftInputOnFocus={false}
        activeOutlineColor="#3C5556"
      />

      {showDatePicker && (
        <DateTimePicker
          value={new Date(paivamaara)}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Button mode="contained" style={styles.button} onPress={handleSubmit}>
        Lisää oppitunti
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
    marginHorizontal: "5%"
  },
  picker: {
    marginBottom: 10,
    width: "90%",
    marginHorizontal: "5%",
  },
  button: {
    marginBottom: 10,
    marginTop: 10,
    width: "90%",
    marginHorizontal: "5%",
    backgroundColor: "#3C5556"
  },
});

