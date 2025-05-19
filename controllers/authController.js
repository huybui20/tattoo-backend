const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

exports.register = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { username, email, password} = req.body;

        const userExists = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }]
            },
            transaction
        });

        if (userExists) {
            await transaction.rollback();
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            token: generateToken(user.id)
        });
    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            token: generateToken(user.id)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.socialAuthSuccess = async (req, res) =>{
    if (req.user) {
        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            user: req.user,
            token: generateToken(req.user.id)
        });
    } else {
        res.status(401).json({
            status: 'error',
            message: 'Not authenticated'
        });
    }
};
exports.socialAuthFailed = async (req, res) =>{
    app.get('/login/failed', (req, res) => {
        res.status(401).json({
            status: 'error',
            message: 'Login failed'
        });
    });
};
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { firstName, lastName, email } = req.body;
        const user = await User.findByPk(req.user.id, { transaction });

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ 
                where: { email },
                transaction 
            });
            if (emailExists) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        await user.update({
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            email: email || user.email
        }, { transaction });

        await transaction.commit();

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        });
    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!(await user.matchPassword(currentPassword))) {
            await transaction.rollback();
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        user.password = newPassword;
        await user.save();
        await transaction.commit();
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ message: error.message });
    }
};