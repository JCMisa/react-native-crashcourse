import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { icons } from "../../constants"
import { router, usePathname } from 'expo-router'

const SearchInput = ({ initialQuery }) => {
    const pathName = usePathname() // getting the current pathname
    const [query, setQuery] = useState(initialQuery || "")

    return (
        <View className='border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary-100 
            items-center flex-row space-x-4'>
            <TextInput
                className='text-base mt-0.5 text-white flex-1 font-pregular'
                value={query}
                placeholder="Search for a video topic..."
                placeholderTextColor={'#CDCDE0'}
                onChangeText={(e => setQuery(e))}
            />

            <TouchableOpacity onPress={() => {
                if (!query) {
                    Alert.alert('Missing Query', "Please input sumting to search results across database")
                }
                if (pathName.startsWith('/search')) { // if already in the /search page
                    router.setParams({ query }) // set the value of [query] from /search to the query state coming from user input
                } else { // if wala ka pa sa /search path then push to that said path
                    router.push(`/search/${query}`)
                }
            }}>
                <Image source={icons.search} className='w-5 h-5' resizeMode='contain' />
            </TouchableOpacity>
        </View>
    )
}

export default SearchInput