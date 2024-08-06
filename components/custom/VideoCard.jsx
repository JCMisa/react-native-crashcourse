import { View, Text, Image, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { icons } from '@/constants'
import { ResizeMode, Video } from 'expo-av'
import { router } from 'expo-router'
import { addToFavorite, getFavoriteVideoId, removeToFavorite } from '@/lib/appwrite'
import useAppwrite from '@/lib/useAppwrite'

const VideoCard = ({ video: { title, thumbnail, video, creator: { $id, username, avatar } } }) => {
    const { data: favoriteId } = useAppwrite(getFavoriteVideoId);
    // console.log("video card: ", favoriteId[0].$id);


    const [play, setPlay] = useState(false)
    const [favorite, setFavorite] = useState(false)

    const addToFavoriteHandle = async () => {
        setFavorite(true)
        const result = await addToFavorite($id, true)
        if (result) {
            Alert.alert("Success", "Added to bookmark");
            console.log(result);
            router.push("/bookmark");
        }
    }

    const removeToFavorites = async () => {
        setFavorite(false)
        const result = await removeToFavorite(favoriteId[0].$id)
        if (result) {
            Alert.alert("Success", "Removed Successfully");
            console.log(result);
            router.push("/home");
        }
    }

    return (
        <View className='flex-col items-center px-4 mb-14'>
            <View className='flex-row gap-3 items-start'>
                <View className='justify-center items-center flex-row flex-1'>
                    <View className='w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5'>
                        <Image source={{ uri: avatar }} className='w-full h-full rounded-lg' resizeMode='cover' />
                    </View>
                    <View className='justify-center flex-1 ml-3 gap-y-1'>
                        <Text className='text-white font-psemibold text-sm' numberOfLines={1}>
                            {title}
                        </Text>
                        <Text className='text-xs text-gray-100 font-pregular' numberOfLines={1}>
                            {username}
                        </Text>
                    </View>
                </View>

                <View className='pt-2 flex flex-row gap-2'>
                    <TouchableOpacity className='-ml-8' onPress={removeToFavorites}>
                        <Image source={icons.heartWhite} width={8} height={8} className='w-8 h-8' resizeMode='contain' />
                    </TouchableOpacity>
                    <TouchableOpacity className='-ml-8' onPress={addToFavoriteHandle}>
                        <Image source={icons.heartRed} width={8} height={8} className='w-8 h-8' resizeMode='contain' />
                    </TouchableOpacity>
                </View>
            </View>

            {play ? (
                <Video
                    source={{ uri: video }}
                    // source={{ uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' }}
                    className="w-full h-60 rounded-xl mt-3"
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    shouldPlay
                    onPlaybackStatusUpdate={(status) => {
                        if (status.didJustFinish) {
                            setPlay(false);
                        }
                    }}
                />
            ) : (
                <TouchableOpacity className='w-full h-60 rounded-xl mt-3 relative justify-center items-center' activeOpacity={0.7} onPress={() => setPlay(true)}>
                    {/* if image source is a url, then use the uri property of Image component */}
                    <Image source={{ uri: thumbnail }} className='w-full h-full rounded-xl mt-3' resizeMode='cover' />
                    <Image source={icons.play} className='w-12 h-12 absolute' resizeMode='contain' />
                </TouchableOpacity>
            )
            }
        </View>
    )
}

export default VideoCard