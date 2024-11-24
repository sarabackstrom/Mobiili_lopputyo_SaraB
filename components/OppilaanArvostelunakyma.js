import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { View, StyleSheet } from "react-native";
import { DataTable, PaperProvider, Text } from "react-native-paper";

export default function App() {
  const [arvioinnit, setArvioinnit] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userUid = user.uid;
      const database = getDatabase();
      const arvioinnitRef = ref(database, `kayttajat/${userUid}/arvioinnit`);

      onValue(arvioinnitRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const arvioinnitArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
          }));

          const userArvioinnit = arvioinnitArray.filter(item => item.tekijaUid !== "ope");


          setArvioinnit(userArvioinnit);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Arvostelut</Text>
        <DataTable style={styles.table}>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title style={styles.column}>Päivämäärä</DataTable.Title>
            <DataTable.Title style={styles.column}>Aihe</DataTable.Title>
            <DataTable.Title numeric style={styles.column}>Taidot</DataTable.Title>
            <DataTable.Title numeric style={styles.column}>Työskentely</DataTable.Title>
            <DataTable.Title style={styles.column}>Kommentti</DataTable.Title>
          </DataTable.Header>

          {arvioinnit.map((item) => (
            <DataTable.Row
              key={item.id}
              style={item.tekijaUid === "ope" ? styles.opeRow : {}}
            >
              <DataTable.Cell style={styles.column}>
                {item.liikuntatunti ? `${item.liikuntatunti.paivamaara}` : "Ei valittu liikuntatuntia"}
              </DataTable.Cell>
              <DataTable.Cell style={styles.column}>
                {item.liikuntatunti ? `${item.liikuntatunti.aihe}` : "Ei valittu liikuntatuntia"}
              </DataTable.Cell>
              <DataTable.Cell numeric style={styles.column}>{item.taidot}</DataTable.Cell>
              <DataTable.Cell numeric style={styles.column}>{item.tyoskentely}</DataTable.Cell>
              <DataTable.Cell style={styles.column}>
                <Text>{item.kommentti}</Text>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f6efe7"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  table: {
    backgroundColor: "#ffffff"
  },
  column: {
    flex: 1, // Tämä jakaa sarakkeet tasaisesti
    justifyContent: "center",
    alignItems: "center", // Tämä keskittyy sarakkeet vertikaalisesti
  },
  commentCell: {
    flexWrap: 'wrap', // Sallii tekstin menevän useammalle riville
    flexShrink: 1,    // Tekstin kokoonpano pienentyy tarvittaessa
  },
});


