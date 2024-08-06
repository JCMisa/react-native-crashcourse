import { Account, Avatars, Client, Databases, ID, Query } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.misa.aora',
    projectId: '66af2c680027cbddd43d',
    databaseId: '66af2da50034de65a0df',
    userCollectionId: '66af2dc4001716857a10',
    videoCollectionId: '66af2df1002b7c9c3a73',
    storageId: '66af2fca000ccee6a8ea'
}

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.
    ;



const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register User
export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )

        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username)

        await signIn(email, password);

        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl
            }
        )

        return newUser;
    } catch (error) {
        console.log("create user error: ", error);
        throw new Error(error)

    }
}

// Login User
export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password)
        return session;
    } catch (error) {
        console.log("log in error: ", error);
        throw new Error(error);
    }
}

// Sign Out
export async function signOut() {
    try {
        const session = await account.deleteSession("current");

        return session;
    } catch (error) {
        throw new Error(error);
    }
}

// Get Current Logged In User
export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)] // get the user with accountId property equal to id of logged in account
        )

        if (!currentUser) throw Error;

        return currentUser.documents[0]
    } catch (error) {
        console.log("get logged in user error: ", error);

    }
}

// Get all posts videos
export const getAllPosts = async () => {
    try {
        const post = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId
        )
        return post.documents;
    } catch (error) {
        throw new Error(error)
    }
}

// get latest video collection
export const getLatestPosts = async () => {
    try {
        const post = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.orderDesc("$createdAt"), Query.limit(7)]
        )
        return post.documents;
    } catch (error) {
        throw new Error(error)
    }
}

// get video based on search query
export async function searchPosts(query) {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.search("title", query)] // check all the record with title property equal to the query and collect them
        );

        if (!posts) throw new Error("Something went wrong");

        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

// Get video posts created by user
export async function getUserPosts(userId) {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.equal("creator", userId)] // gets the videos where creator property is equal to userId passed in parameter
        );

        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}