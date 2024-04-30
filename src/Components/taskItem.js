import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import CheckBox from "expo-checkbox";
import { useNavigation } from "@react-navigation/native";
import { getDatabase, ref, remove, update } from "firebase/database";

// Component for style specific texts
const B = (props) => (
  <Text style={{ fontWeight: "bold", letterSpacing: 1, color: "#fff" }}>
    {props.children}
  </Text>
);

export default function TaskItem(props) {
  // Constants for navigation
  const navigation = useNavigation();

  // Define Today's Date
  let day = new Date().getDate();
  let month = new Date().getMonth();
  let year = new Date().getFullYear();
  const todayDate = `${day}-${month + 1}-${year}`;

  // Constants for Firebase
  const db = getDatabase();
  const taskRef = ref(db, `Tasks/${todayDate}`);

  // State for checking if the task is completed or not
  const [isChecked, setIsChecked] = useState(props.data.completed);

  // Function for updating a task
  function updateTask() {
    setIsChecked(!isChecked);
    update(ref(db, `Tasks/${todayDate}/${props.data.key}`), {
      Completed: !isChecked,
    });
  }

  // Function for removing a task
  function removeTask() {
    Alert.alert("Remove Task", "Remove this task from today's list?", [
      {
        text: "No",
      },
      {
        text: "Yes",
        onPress: () =>
          remove(ref(db, `Tasks/${todayDate}/${props.data.key}`))
            .then(() => {
              alert("Task Removed");
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
              });
            })
            .catch((error) => {
              alert("Erro removing task");
            }),
      },
    ]);
  }

  return (
    <SafeAreaView>
      <TouchableOpacity
        style={styles.taskView}
        onPress={() => updateTask()}
        onLongPress={() => removeTask()}
      >
        <CheckBox style={styles.checkbox} value={isChecked} color="#252525" />
        <Text>
          <B>{props.data.description}</B>
        </Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  taskView: {
    backgroundColor: "#10b981",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: "#252525",
    borderRadius: 10,
  },
  checkbox: {
    width: 25,
    height: 25,
  },
});
