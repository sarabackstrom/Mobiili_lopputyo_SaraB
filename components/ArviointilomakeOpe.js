import { useState, useEffect, Text } from "react";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { getDatabase, ref, push, set, onValue } from "firebase/database";
import { Picker } from "@react-native-picker/picker";

export default function ArviointilomakeOpe() {
  const [kayttajat, setKayttajat] = useState([]);
  const [liikuntatunti, setLiikuntatunti] = useState("");
  const [tyoskentely, setTyoskentely] = useState("");
  const [taidot, setTaidot] = useState("");
  const [kommentti, setKommentti] = useState("");
  const [liikuntatuntilista, setLiikuntatuntilista] = useState([]);
  const [oppilaat, setOppilaat] = useState([]);
  const [valittuOppilas, setValittuOppilas] = useState("");
  const [valitunOppilaanLuokka, setValitunOppilaanLuokka] = useState("");
  const [pickerVisibleOppilas, setPickerVisibleOppilas] = useState(false);
  const [pickerVisibleOppitunti, setPickerVisibleOppitunti] = useState(false);
  const [originalLiikuntatuntilista, setOriginalLiikuntatuntilista] = useState([]);
  const [valittuTunti, setValittuTunti] = useState("")
  const database = getDatabase();

  // Haetaan oppilaat Firebasesta
  useEffect(() => {
    const kayttajatRef = ref(database, "kayttajat");
    onValue(kayttajatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const oppilasLista = Object.entries(data)
          .filter(([key, kayttaja]) => kayttaja.luokka && kayttaja.luokka !== "ope")
          .map(([key, kayttaja]) => ({ uid: key, ...kayttaja }));

        console.log("Kannasta haetut oppilaat", oppilasLista);
        setOppilaat(oppilasLista);
      } else {
        setOppilaat([]);
      }
    });
  }, []);

  // Haetaan oppitunnit Firebasesta
  useEffect(() => {
    const oppitunnitRef = ref(database, "oppitunnit");
    onValue(oppitunnitRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const oppituntiLista = Object.entries(data).map(([key, oppitunti]) => ({
          oppituntiUid: key,
          ...oppitunti,
        }));

        // Tallennetaan alkuperäinen lista
        setOriginalLiikuntatuntilista(oppituntiLista);
        setLiikuntatuntilista(oppituntiLista);
        console.log("Oppitunnit tallennettu:", oppituntiLista);
      } else {
        setLiikuntatuntilista([]);
      }
    });
  }, []);

  // Valitaan oppilas, jota arvioidaan ja päivitetään liikuntatuntilista vastaamaan oppilaan luokan liikuntatunteja
  const handleOppilasChange = (value) => {
    setValittuOppilas(value);

    const oppilas = oppilaat.find((oppilas) => oppilas.uid === value);
    if (!oppilas) return;

    const oppilaanLuokka = oppilas?.luokka || "";
    setValitunOppilaanLuokka(oppilaanLuokka);

    console.log("Valitun oppilaan luokka:", oppilaanLuokka);

    if (oppilaanLuokka) {
      const suodatettuLista = originalLiikuntatuntilista
        .filter((tunti) => tunti.luokka === oppilaanLuokka)


      setLiikuntatuntilista(suodatettuLista);
      console.log("Päivitetty liikuntatuntilista:", suodatettuLista);
    } else {
      setLiikuntatuntilista([]);
    }
  };





  const handleOppituntiChange = (itemValue) => {
    setLiikuntatunti(itemValue);
    const valittuTuntikokonaisuus = liikuntatuntilista.find(tunti => tunti.oppituntiUid === itemValue);
    setValittuTunti(valittuTuntikokonaisuus)
    console.log("Valittu liikuntatunti:", valittuTunti);
  };

  const handleSubmit = async () => {
    if (!valittuOppilas || !liikuntatunti || !tyoskentely || !taidot || !kommentti) {
      console.log("Kaikki kentät on täytettävä!");
      return;
    }

    const arviointi = {
      liikuntatunti: valittuTunti,
      tyoskentely,
      taidot,
      kommentti,
      tekijaUid: "ope",
    };

    const arviointiRef = ref(database, `kayttajat/${valittuOppilas}/arvioinnit`);
    const newArviointiRef = push(arviointiRef);
    await set(newArviointiRef, arviointi);

    console.log("Arviointi lisätty oppilaalle", valittuOppilas);
    setLiikuntatunti("");
    setTyoskentely("");
    setTaidot("");
    setKommentti("");
    setValittuOppilas("");
    setValitunOppilaanLuokka("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        label="Valitse oppilas"
        value={valittuOppilas ? oppilaat.find((oppilas) => oppilas.uid === valittuOppilas)?.kayttajanimi || "" : ""}
        mode="outlined"
        style={styles.input}
        right={
          <TextInput.Icon
            icon="chevron-down"
            onPress={() => setPickerVisibleOppilas(!pickerVisibleOppilas)}
          />
        }
        editable={false}
      />
      {pickerVisibleOppilas && (
        <Picker
          selectedValue={valittuOppilas}
          onValueChange={handleOppilasChange}
          style={styles.picker}
        >
          <Picker.Item label="Valitse oppilas" value="" />
          {oppilaat.map((oppilas) => (
            <Picker.Item key={oppilas.uid} label={oppilas.kayttajanimi} value={oppilas.uid} />
          ))}
        </Picker>
      )}

      <TextInput
        label="Valitse liikuntatunti"
        value={liikuntatunti
          ? liikuntatuntilista.find((tunti) => tunti.oppituntiUid === liikuntatunti)?.paivamaara || "Ei valittu oppituntia"
          : "Ei valittu oppituntia"}
        mode="outlined"
        style={styles.input}
        right={
          <TextInput.Icon
            icon="chevron-down"
            onPress={() => setPickerVisibleOppitunti(!pickerVisibleOppitunti)}
          />
        }
        editable={false}
      />

      {pickerVisibleOppitunti && (
        <Picker
          selectedValue={liikuntatunti}
          onValueChange={handleOppituntiChange}
          style={styles.picker}
        >
          <Picker.Item label="Valitse oppitunti" value="" />
          {liikuntatuntilista.map((oppitunti) => (
            <Picker.Item key={oppitunti.oppituntiUid} label={oppitunti.paivamaara ? `(${oppitunti.paivamaara}) ${oppitunti.aihe}` : oppitunti.paivamaara} value={oppitunti.oppituntiUid} />
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
    backgroundColor: "#f6efe7"
  },
  input: {
    marginBottom: 15,
  },
  picker: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#3C5556"
  },
});
