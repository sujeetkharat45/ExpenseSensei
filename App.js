import React from "react";
import { useFonts } from "expo-font";
import AppNavigator from "./src/navigation/AppNavigator";
import { AppProvider } from "./src/Context/AppContext";
import { AuthProvider } from "./src/Context/AuthContext";

export default function App() {
  const [loaded] = useFonts({
    Poppins: require("./assets/fonts/Poppins-Regular.ttf"),
  });

  if (!loaded) return null;

  return (
    <AuthProvider>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </AuthProvider>
  );
}