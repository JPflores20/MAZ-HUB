import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";

export type UserRole = "admin" | "user";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  area: string;
  createdAt?: string;
}

const USERS_COLLECTION = "users";

export const userService = {
  async getUser(uid: string): Promise<UserProfile | null> {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (userDoc.exists()) {
      return { uid, ...userDoc.data() } as UserProfile;
    }
    return null;
  },

  async createUser(uid: string, data: Omit<UserProfile, "uid">): Promise<void> {
    await setDoc(doc(db, USERS_COLLECTION, uid), data);
  },

  async updateUserRole(uid: string, role: UserRole): Promise<void> {
    await setDoc(doc(db, USERS_COLLECTION, uid), { role }, { merge: true });
  },

  async deleteUser(uid: string): Promise<void> {
    await deleteDoc(doc(db, USERS_COLLECTION, uid));
  },

  subscribeToUsers(
    onData: (users: UserProfile[]) => void,
    onError: (err: Error) => void,
  ): Unsubscribe {
    return onSnapshot(
      collection(db, USERS_COLLECTION),
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, any>;
          list.push({
            uid: docSnap.id,
            name: (d["name"] as string) || "Usuario",
            email: (d["email"] as string) || "",
            role: (d["role"] as UserRole) || "user",
            area: (d["area"] as string) || "Usuario",
            createdAt: d["createdAt"] as string,
          });
        });
        onData(list);
      },
      (err) => {
        onError(err);
      },
    );
  },
};
