import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Button, Text } from "react-native-paper";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import Kirjautumisivu from "./components/Kirjautumissivu";
import Arviointilomake from "./components/Arviointilomake";
import { handleLogout } from "./components/Authentication";
import ArviointilomakeOpe from "./components/ArviointilomakeOpe";
import Oppitunti from "./components/Oppitunti";
import OppilaanArvostelunakyma from "./components/OppilaanArvostelunakyma.js";
import Arvostelut from "./components/Arvostelut.js";

const Drawer = createDrawerNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userLuokka, setUserLuokka] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User authenticated:", user.uid);
        setIsAuthenticated(true);

        // Hae käyttäjän luokka tietokannasta
        const database = getDatabase();
        const userRef = ref(database, `kayttajat/${user.uid}/luokka`);

        onValue(userRef, (snapshot) => {
          const luokka = snapshot.val();
          if (luokka) {
            console.log("User's class:", luokka);
            setUserLuokka(luokka);
          } else {
            console.log("Luokka not found for user.");
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user class:", error);
          setLoading(false);
        });
      } else {
        console.log("User not authenticated");
        setIsAuthenticated(false);
        setUserLuokka(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName={isAuthenticated ? (userLuokka === "ope" ? "Arviointikirja" : "Arvioinnit") : "Kirjautuminen"}
      screenOptions={{
        drawerStyle: {
          backgroundColor: "#f6efe7",
        },
        drawerActiveTintColor: "#3C5556",
        headerStyle: {
          backgroundColor: "#3C5556", // Yläpalkin taustaväri
        },
        headerTintColor: "#ffffff"
      }}>
        {/* Näytetään kirjautumissivu, jos käyttäjä ei ole kirjautunut */}
        {!isAuthenticated && (
          <Drawer.Screen name="Kirjautuminen">
            {({ navigation }) => (
              <Kirjautumisivu
                onLogin={() => setIsAuthenticated(true)} // Käyttäjän kirjautuminen
              />
            )}
          </Drawer.Screen>
        )}

        {/* Näytetään opettajan tai oppilaan lomake käyttäjän luokan mukaan */}
        {isAuthenticated && userLuokka === "ope" && (
          <>
            <Drawer.Screen name="Arviointikirja" component={Arvostelut} />
            <Drawer.Screen name="Opettajan arviointilomake" component={ArviointilomakeOpe} />
            <Drawer.Screen name="Lisää oppitunti" component={Oppitunti} />
          </>
        )}

        {isAuthenticated && userLuokka !== "ope" && (
          <>
            <Drawer.Screen name="Arvioinnit" component={OppilaanArvostelunakyma} />
            <Drawer.Screen name="Oppilaan arviointilomake" component={Arviointilomake} />
          </>
        )}

        {/* Kirjaudu ulos */}
        {isAuthenticated && (
          <Drawer.Screen name="Kirjaudu ulos">
            {({ navigation }) => (
              <View style={styles.logoutContainer}>
                <Text style= {{paddingBottom: 10}}>Kiva, että kävit. Nähdään taas pian!</Text>
                <Button
                style={styles.button}
                  mode="contained"
                  onPress={() => {
                    handleLogout();
                    setIsAuthenticated(false);
                    setUserLuokka(null);
                  }}
                >
                  Kirjaudu ulos
                </Button>
              </View>
            )}
          </Drawer.Screen>
        )}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  logoutContainer: {
    padding: 20,
      backgroundColor: "#f6efe7",
      height: "100%"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#3C5556"
  }
});
