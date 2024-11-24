import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { DataTable, Text } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons } from "react-native-vector-icons";

export default function App() {
  const [arvioinnit, setArvioinnit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null); // Kommentin tila
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const database = getDatabase();
    const studentsRef = ref(database, "kayttajat");

    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      const studentsList = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          const student = data[key];
          if (student.uid) {
            studentsList.push({
              uid: student.uid,
              name: student.kayttajanimi,
            });
          }
        });
      }
      setStudents(studentsList);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      const database = getDatabase();
      const arvioinnitRef = ref(database, `kayttajat/${selectedStudent}/arvioinnit`);

      onValue(arvioinnitRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const arvioinnitArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          arvioinnitArray.sort((a, b) => new Date(a.liikuntatunti) - new Date(b.liikuntatunti));
          setArvioinnit(arvioinnitArray);
        } else {
          setArvioinnit([]);
        }
        setLoading(false);
      });
    }
  }, [selectedStudent]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const openCommentModal = (comment) => {
    setSelectedComment(comment);
    setModalVisible(true);
  };

  const closeCommentModal = () => {
    setModalVisible(false);
    setSelectedComment(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Valitse Oppilas</Text>
      <Picker
        style={styles.picker}
        selectedValue={selectedStudent}
        onValueChange={(itemValue) => {
          setSelectedStudent(itemValue);
          setLoading(true);
        }}
      >
        <Picker.Item label="Valitse oppilas" value={null} />
        {students.map((student) => (
          <Picker.Item key={student.uid} label={student.name} value={student.uid} />
        ))}
      </Picker>

      {selectedStudent && (
        <>
          <Text style={[styles.title, {paddingBottom:10}]}>Arvostelut</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons name="account" size={20} color="#C8D8D7" />
            <Text>Opettaja</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", paddingBottom: 10 }}>
            <MaterialCommunityIcons name="account" size={20} color="#ffffff" />
            <Text>Oppilas</Text>
          </View>
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
                <DataTable.Cell style={styles.column}> {item.liikuntatunti ? `${item.liikuntatunti.paivamaara}` : "Ei valittu liikuntatuntia"}</DataTable.Cell>
                <DataTable.Cell style={styles.column}> {item.liikuntatunti ? `${item.liikuntatunti.aihe}` : "Ei valittu liikuntatuntia"}</DataTable.Cell>
                <DataTable.Cell numeric style={styles.column}>{item.taidot}</DataTable.Cell>
                <DataTable.Cell numeric style={styles.column}>{item.tyoskentely}</DataTable.Cell>
                <DataTable.Cell style={styles.column}>
                  <MaterialCommunityIcons
                    name="information"
                    size={24}
                    color="#3C5556"
                    onPress={() => openCommentModal(item.kommentti)}
                  />
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
          <Modal visible={isModalVisible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Kommentti</Text>
                <Text style={styles.modalText}>{selectedComment || "Ei kommenttia"}</Text>
                <Pressable onPress={closeCommentModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Sulje</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
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
    paddingBottom: 5
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  table: {
    backgroundColor: "#ffffff"
  },
  column: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "ffffff"
  },
  opeRow: {
    backgroundColor: "#C8D8D7"
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Läpinäkyvä tausta
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#3C5556",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  }
});




