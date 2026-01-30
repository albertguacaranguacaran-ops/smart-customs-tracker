// Firestore Service for Container Management
// Handles CRUD operations for containers in Firebase

import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Container } from '../types';

const CONTAINERS_COLLECTION = 'containers';

// Get all containers (one-time fetch)
export async function getContainers(): Promise<Container[]> {
    const containersRef = collection(db, CONTAINERS_COLLECTION);
    const q = query(containersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Container[];
}

// Subscribe to real-time updates
export function subscribeToContainers(callback: (containers: Container[]) => void) {
    const containersRef = collection(db, CONTAINERS_COLLECTION);
    const q = query(containersRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const containers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Container[];
        callback(containers);
    });
}

// Add new container
export async function addContainer(container: Omit<Container, 'id'>): Promise<string> {
    const containersRef = collection(db, CONTAINERS_COLLECTION);
    const docRef = await addDoc(containersRef, {
        ...container,
        createdAt: Timestamp.now()
    });
    return docRef.id;
}

// Update container
export async function updateContainer(id: string, data: Partial<Container>): Promise<void> {
    const containerRef = doc(db, CONTAINERS_COLLECTION, id);
    await updateDoc(containerRef, {
        ...data,
        updatedAt: Timestamp.now()
    });
}

// Delete container
export async function deleteContainer(id: string): Promise<void> {
    const containerRef = doc(db, CONTAINERS_COLLECTION, id);
    await deleteDoc(containerRef);
}

// Update container status (for Kanban drag-drop)
export async function updateContainerStatus(id: string, newStatus: Container['status']): Promise<void> {
    return updateContainer(id, { status: newStatus });
}
