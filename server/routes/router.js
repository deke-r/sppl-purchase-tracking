const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const authenticate=require('../middleware/auth');

const currentTimestamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');


const sequelize = require("../db/config");

const User = require('../models/User');
const ProjectManager=require('../models/ProjectManager');
const MaterialRequest=require('../models/MaterialRequest');
const MaterialRequestItem=require('../models/MaterialRequestItem');


router.post('/register', async (req, res) => {
    const { name, email, pass, role, department } = req.body;

    const hashedPassword = await bcrypt.hash(pass, 10);

    if (!name || !email || !pass || !role) {
        return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    try {

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already taken' });
        }


        const newUser = await User.create({
            name,
            email,
            pass: hashedPassword,
            role,
            department,
            createdAt: currentTimestamp,
            // updatedAt: currentTimestamp, 
        });

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error });
    }
});






router.post('/login', async (req, res) => {
    console.log('req.body: ', req.body);
    const email = req.body.userId
    const pass = req.body.password

    try {

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        const isMatch = await bcrypt.compare(pass, user.pass);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
        const token = jwt.sign(
            payload,
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
          );
          

        return res.status(200).json({
            message: 'Login successful',
            token,
            role: user.role

        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/managers',authenticate,async(req,res)=>{
    try {

      const managers=await ProjectManager.findAll({
        attributes:['name','email','designation']
      })
      res.json(managers);
        
        
        
    } catch (error) {
        console.log('error: ', error);
    }
})

router.post('/material-request', authenticate, async (req, res) => {
    try {
      // Destructuring the incoming request body
      const {
        projectDetails,
        sheetNo,
        requirementDate,
        deliveryPlace,
        managers, // Array of manager objects with 'value' and 'label' properties
        materials, 
      } = req.body;
  
      // Log the request body for debugging
      console.log('req.body: ', req.body);
  
      // Log the manager emails joined by comma to verify
      console.log(managers.map(manager => manager.value).join(','));
  
      // Retrieve the user ID (assumes the user is authenticated and `req.user` is populated)
      let userId = req.user.id;
  
      // Get the last ticket ID to generate the next one
      const lastRequest = await MaterialRequest.findOne({
        order: [['ticket_id', 'DESC']],
      });
  
      // Set the next ticket ID
      const nextTicketId = lastRequest ? lastRequest.ticket_id + 1 : 1000;
  
      // Create the material request
      const newRequest = await MaterialRequest.create({
        ticket_id: nextTicketId,
        user_id: userId,
        project_details: projectDetails,
        sheet_no: sheetNo,
        requirement_date: requirementDate,
        delivery_place: deliveryPlace,
        manager_emails: managers.map(m => m.value).join(','), // Extract emails using 'value' and join them
        status: 1,
        status_track: 'Sent to management',
        last_updated: new Date(),
      });
  
      // Create associated material items
      const itemInserts = materials.map((item) => ({
        ...item,
        ticket_id: nextTicketId,
      }));
  
      // Insert material items into the MaterialRequestItem table
      await MaterialRequestItem.bulkCreate(itemInserts);
  
      // Return a success response with the ticket ID
      res.status(201).json({
        success: true,
        ticket_id: nextTicketId,
        message: 'Material request created successfully',
      });
    } catch (error) {
      // Catch and log any errors
      console.error('Error creating material request:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  router.get('/materials', authenticate, async (req, res) => {
    try {
      const { status } = req.query;
  
      if (status && !['0', '1'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status parameter' });
      }
  
      const materials = await MaterialRequest.findAll({
        where: {
          ...(status && { status: status }), 
        },
      });
  
      if (materials.length === 0) {
        return res.status(404).json({ message: 'No materials found for the given status' });
      }
  
      console.log(materials)
      res.status(200).json(materials); 
    } catch (error) {
      console.error('Error fetching materials:', error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  });
  
module.exports = router;