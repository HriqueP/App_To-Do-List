import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
  Keyboard,
  TextInput,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { firebaseConfig, app } from "../../../src/firebaseConfig";
import { getDatabase, ref, child, get, set, push } from "firebase/database";
import TaskList from "../../Components/taskItem";

// Component for style specific texts
const B = (props) => (
  <Text style={{ fontWeight: "bold", letterSpacing: 1 }}>{props.children}</Text>
);

export default function Home() {
  // Constants for navigation
  const navigation = useNavigation();

  // Set animation for loading
  const [loading, setLoading] = useState(false);

  // States
  const [task, setTask] = useState(""); // For task input
  const [tasks, setTasks] = useState([]); // For tasks list

  // Define Today's Date
  let day = new Date().getDate();
  let month = new Date().getMonth();
  let year = new Date().getFullYear();
  const todayDate = `${day}-${month + 1}-${year}`;
  const formatedDate = todayDate.replace(/-/g, "/"); // Only form today's data formating (visual)

  // Constants for Firebase
  const db = getDatabase();
  const dbRef = ref(db);
  const taskRef = ref(db, `Tasks/${todayDate}`);
  const newTaskRef = push(taskRef);

  // Function to save the new task into the Firebase
  function saveNewTask() {
    set(newTaskRef, {
      Description: task,
      Completed: false,
    })
      .then(() => {
        alert("New Task Added Succefully!");
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      })
      .catch((error) => {
        // console.log(error);
      });
  }

  // Function to search today's tasks
  function getAllTasks() {
    get(child(dbRef, `Tasks/${todayDate}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          snapshot?.forEach((childSnapshot) => {
            let data = {
              key: childSnapshot.key,
              description: childSnapshot.val().Description,
              completed: childSnapshot.val().Completed,
            };
            setTasks((oldTasks) => [...oldTasks, data]);
            setLoading(true);
          });
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        // console.error(error);
      });
  }

  // Its executed as soon as the screen is loaded
  useEffect(() => {
    getAllTasks();
  }, []); // Empty array makes it run only one time

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.viewNewTasks}>
          <TextInput
            placeholder="Type Task"
            onChangeText={(task) => setTask(task)}
            style={styles.inputTask}
          />
          <TouchableOpacity
            onPress={() => saveNewTask()}
            style={styles.buttonSaveTask}
          >
            <Feather name="plus-square" size={40} color="#10b981" />
          </TouchableOpacity>
        </View>

        <View style={styles.viewListTasks}>
          <Text style={styles.listTitle}>{formatedDate}</Text>
          {loading ? (
            // If loading = True
            <FlatList
              style={styles.tasksFlatlist}
              data={tasks}
              ItemSeparatorComponent={() => (
                <View style={{ height: 5, backgroundColor: "#fff" }} />
              )}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => <TaskList data={item} />}
              extraData={tasks}
            />
          ) : (
            // If loading = False
            <View style={styles.viewActivityIndicator}>
              <Text>
                <B>NO TASKS FOR TODAY YET!</B>
              </Text>
              <ActivityIndicator color={"#10b981"} size={30} />
            </View>
          )}
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 70,
  },

  // Add new task
  viewNewTasks: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: "90%",
    gap: 10,
  },
  inputTask: {
    flex: 1,
    width: "80%",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: "#10b981",
    borderRadius: 10,
  },
  buttonSaveTask: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Display list of tasks
  viewListTasks: {
    flex: 1,
    width: "90%",
    maxHeight: "90%",
    paddingTop: 10,
  },
  listTitle: {
    width: "100%",
    paddingBottom: 5,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#10b981",
    fontWeight: "600",
  },
  tasksFlatlist: {
    paddingVertical: 10,
  },

  // Loading when have no tasks
  viewActivityIndicator: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 20,
  },
});
