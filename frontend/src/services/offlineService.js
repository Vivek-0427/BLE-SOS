const DB_NAME= 'sosSystemDB';
const STORE_NAME= 'sosQueue';
const DB_VERSION= 1;

// Open the IndexedDB database

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'localId', autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

// Save SOS locally to IndexedDB

export const saveSOSOffline = async (sosData) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add({
            ...sosData,
            savedAt: new Date().toISOString(),
            synced: false
        });

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

// Get all unsynced SOS from IndexedDB

export const getUnsyncedSOS = async () => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result.filter(item => item.synced === false));
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

// Delete SOS from IndexedDB after successful sync

export const deleteSyncedSOS = async (localId) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(localId);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Sync unsynced SOS to the server when online

export const syncUnsyncedSOS = async (createSOSEvent) => {
    const unsyncedSOS = await getUnsyncedSOS();

    if (unsyncedSOS.length === 0) {
        console.log('No unsynced SOS to sync.');
        return;
    }

    console.log(`Syncing ${unsyncedSOS.length} unsynced SOS...`);

    for (const sos of unsyncedSOS) {
        try {
            // Remove IndexedDB-only fields
            const { localId, savedAt, synced, ...sosData } = sos;

            // Upload to firebase
            const firebaseEvent = await createSOSEvent(sosData);

            console.log(`Successfully synced SOS with localId ${localId} to Firebase. Firebase ID: ${firebaseEvent.id}`);

            // Mark as synced in IndexedDB
            await deleteSyncedSOS(localId);
            console.log(`Successfully synced SOS with localId ${localId} to Firebase.`);
        }
        catch (error) {
            console.error(`Failed to sync SOS with localId ${sos.localId}:`, error);
        }
    }
}
