import { User, UserRole, IUser } from '../models/user.model';
import * as admin from 'firebase-admin';

export class UserService {
  // Create user with Firebase and MongoDB
  static async createUser(
    email: string, 
    password: string, 
    role: UserRole,
    additionalData: Partial<IUser> = {}
  ) {
    try {
      // Create user in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email,
        password,
        disabled: false
      });

      // Create user in MongoDB
      const user = new User({
        firebaseUid: userRecord.uid,
        email,
        role,
        ...additionalData,
        lastLogin: new Date()
      });

      await user.save();

      // Set custom user claims in Firebase
      await admin.auth().setCustomUserClaims(userRecord.uid, { role });

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user role
  static async updateUserRole(firebaseUid: string, newRole: UserRole) {
    try {
      // Update Firebase custom claims
      await admin.auth().setCustomUserClaims(firebaseUid, { role: newRole });

      // Update MongoDB
      const user = await User.findOneAndUpdate(
        { firebaseUid },
        { 
          role: newRole,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Get user by Firebase UID
  static async getUserByFirebaseUid(firebaseUid: string) {
    return await User.findOne({ firebaseUid });
  }
}