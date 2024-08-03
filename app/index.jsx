import { Link, Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-black">Aora</Text>
      <StatusBar />
      <Link href={"/home"} style={{ color: "blue" }}>
        Go to home
      </Link>
    </View>
  );
}
