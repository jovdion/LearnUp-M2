import User from '../models/UserModel.js';
//import bcrypt from 'bcrypt';
//import jwt from 'jsonwebtoken';

export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role']
        });
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                id: req.params.id
            },
            attributes: ['id', 'name', 'email', 'role']
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        await User.create({
            name: name,
            email: email,
            password: password,
            role: role
        });
        res.json({ message: "Registration Successful" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Registration Failed" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { name, password } = req.body;
        if (name) user.name = name;
        if (password) user.password = password; // simpan plain text
        await user.save();
        res.status(200).json({ message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    const user = await User.findOne({
        where: {
            id: req.params.id
        }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    try {
        await User.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({ message: "User Deleted" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Delete Failed" });
    }
};

export const login = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                email: req.body.email
            }
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (req.body.password !== user.password) return res.status(400).json({ message: "Wrong Password" });
        res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await User.findOne({
        where: {
            refresh_token: refreshToken
        }
    });
    if (!user) return res.sendStatus(204);
    const userId = user.id;
    await User.update({ refresh_token: null }, {
        where: {
            id: userId
        }
    });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
};

export const getMe = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Please login to your account!" });
    }
    const user = await User.findOne({
        where: {
            id: req.userId
        },
        attributes: ['id', 'name', 'email', 'role']
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
};
