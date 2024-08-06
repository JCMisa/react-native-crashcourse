import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VideoCard from "@/components/custom/VideoCard";
import SearchInput from "@/components/custom/SearchInput";
import EmptyState from "@/components/custom/EmptyState";
import useAppwrite from "@/lib/useAppwrite";
import { getSavedVideos, getFavoriteVideoId, getAllPosts, searchPosts } from "@/lib/appwrite";
import { StatusBar } from "expo-status-bar";
import { icons } from "@/constants";

const Bookmark = () => {
  const [refreshing, setRefreshing] = useState(false)

  const { data: favoriteId } = useAppwrite(getFavoriteVideoId);
  const { data: posts, refetch } = useAppwrite(() => getSavedVideos(favoriteId[0].videoId));

  console.log("bookmark: ", favoriteId[0]);


  const onRefresh = async () => {
    setRefreshing(true)
    await refetch(); // get the data again
    setRefreshing(false)
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            video={item}
          />
        )}
        ListHeaderComponent={() => (
          <>
            <View className="flex my-6 px-4">
              <Text className="text-2xl font-psemibold text-white mt-1">
                Saved Videos
              </Text>

              <View className="mt-6 mb-8">
                {/* <View className='border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary-100 
            items-center flex-row space-x-4'>
                  <TextInput
                    className='text-base mt-0.5 text-white flex-1 font-pregular'
                    value={query}
                    placeholder="Search for a video topic..."
                    placeholderTextColor={'#CDCDE0'}
                    onChangeText={(e => setQuery(e))}
                  />

                  <TouchableOpacity onPress={() => refetch()}>
                    <Image source={icons.search} className='w-5 h-5' resizeMode='contain' />
                  </TouchableOpacity>
                </View> */}
              </View>
            </View>
          </>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this search query"
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
};

export default Bookmark;
