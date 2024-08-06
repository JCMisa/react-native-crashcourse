import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.misa.aora',
    projectId: '66af2c680027cbddd43d',
    databaseId: '66af2da50034de65a0df',
    userCollectionId: '66af2dc4001716857a10',
    videoCollectionId: '66af2df1002b7c9c3a73',
    favoritesCollectionId: '66b201770033b3d3f71e',
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
const storage = new Storage(client);

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

// Get File Preview
export async function getFilePreview(fileId, type) {
    let fileUrl;

    try {
        if (type === "video") {
            fileUrl = storage.getFileView(config.storageId, fileId);
        } else if (type === "image") {
            fileUrl = storage.getFilePreview(
                config.storageId,
                fileId,
                2000,
                2000,
                "top",
                100
            );
        } else {
            throw new Error("Invalid file type");
        }

        if (!fileUrl) throw Error;

        return fileUrl;
    } catch (error) {
        throw new Error(error);
    }
}

// Upload File
export const uploadFile = async (file, type) => {
    if (!file) return;

    // const { mimeType, ...rest } = file;
    const asset = {
        name: file.fileName,
        type: file.mimeType,
        size: file.fileSize,
        uri: file.uri,
    }

    try {
        const uploadedFile = await storage.createFile(
            config.storageId,
            ID.unique(),
            asset
        );

        const fileUrl = await getFilePreview(uploadedFile.$id, type);
        return fileUrl;
    } catch (error) {
        throw new Error(error);
    }
}

// Create Video Post
export async function createVideoPost(form) {
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail, "image"),
            uploadFile(form.video, "video"),
        ]);

        const newPost = await databases.createDocument(
            config.databaseId,
            config.videoCollectionId,
            ID.unique(),
            {
                title: form.title,
                thumbnail: thumbnailUrl,
                video: videoUrl,
                prompt: form.prompt,
                creator: form.userId,
            }
        );

        return newPost;
    } catch (error) {
        throw new Error(error);
    }
}

// Get all posts videos
export const getAllPosts = async () => {
    try {
        const post = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.orderDesc("$createdAt")]
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
            [Query.equal("creator", userId), Query.orderDesc('$createdAt')] // gets the videos where creator property is equal to userId passed in parameter
        );

        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

// get saved videos
export const getSavedVideos = async (favoriteId) => {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.equal("creator", favoriteId)]
        );

        if (!posts) throw new Error("Something went wrong");

        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

// get favorite colletion records
export const getFavoriteVideoId = async () => {
    try {
        const favorites = await databases.listDocuments(
            config.databaseId,
            config.favoritesCollectionId
        );
        console.log("api video id: ", favorites.documents);

        return favorites.documents
    } catch (error) {
        throw new Error(error);
    }
};

// add to favorite
export const addToFavorite = async (videoId, isFavorite) => {
    try {
        const favorite = await databases.createDocument(
            config.databaseId,
            config.favoritesCollectionId,
            ID.unique(),
            {
                videoId: videoId,
                isFavorite: isFavorite
            }
        );

        return favorite;
    } catch (error) {
        console.log("create user error: ", error);
        throw new Error(error)

    }
}

// delete to favorite
export const removeToFavorite = async (favoriteId) => {
    try {
        const favorite = await databases.deleteDocument(
            config.databaseId,
            config.favoritesCollectionId,
            favoriteId
        );

        return favorite;
    } catch (error) {
        console.log("delete user error: ", error);
        throw new Error(error)

    }
}