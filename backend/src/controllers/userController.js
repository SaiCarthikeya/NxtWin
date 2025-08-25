import User from '../models/user.model.js';

export const registerUser = async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const { email, username } = req.body;

        const existingUser = await User.findOne({ clerkId });
        if (existingUser) {
            return res.status(200).json(existingUser);
        }

        // --- THIS IS THE FIX ---
        // If the username from Clerk is null or undefined, create one from the email.
        const newUsername = username || email.split('@')[0];

        const newUser = await User.create({
            clerkId,
            email,
            username: newUsername,
        });
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ error: 'Failed to register user in database' });
    }
};

export const getUserByClerkId = async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const user = await User.findOne({ clerkId: clerkId });
        if (!user) {
            return res.status(404).json({ error: 'User not found in our database.' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// You can keep the syncUser function for webhooks if you want, or remove it.
export const syncUser = async (req, res) => {
    if (req.body.type === 'user.created') {
        const { id, email_addresses, username } = req.body.data;
        try {
            await User.create({
                clerkId: id,
                email: email_addresses[0].email_address,
                username: username || email_addresses[0].email_address.split('@')[0],
            });
            res.status(201).json({ message: 'User synced successfully' });
        } catch (error) {
            console.error('Error syncing user:', error);
            res.status(500).json({ error: 'Failed to sync user' });
        }
    } else {
        res.status(200).json({ message: 'Event received' });
    }
};