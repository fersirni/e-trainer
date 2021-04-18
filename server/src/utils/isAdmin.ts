import { User } from "../entities/User";

export async function isAdmin(userId: number) {
    const currentUser = await User.findOne(userId);
    return currentUser && currentUser.profile === "admin";
};
