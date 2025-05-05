const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const authenticate=require('../middleware/auth');
const multer=require('multer');
const path=require('path')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
});
const upload = multer({ storage: storage })

const currentTimestamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');


const sequelize = require("../db/config");

const User = require('../models/User');
const ProjectManager=require('../models/ProjectManager');
const MaterialRequest=require('../models/MaterialRequest');
const MaterialRequestItem=require('../models/MaterialRequestItem');
const { Op } = require('sequelize');

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
      const {
        projectDetails,
        sheetNo,
        requirementDate,
        deliveryPlace,
        managers, 
        materials, 
      } = req.body;
  
      console.log('req.body: ', req.body);
  
      console.log(managers.map(manager => manager.value).join(','));
  
      let userId = req.user.id;
  
      const lastRequest = await MaterialRequest.findOne({
        order: [['ticket_id', 'DESC']],
      });
  
      const nextTicketId = lastRequest ? lastRequest.ticket_id + 1 : 1000;
  
      const newRequest = await MaterialRequest.create({
        ticket_id: nextTicketId,
        user_id: userId,
        project_details: projectDetails,
        sheet_no: sheetNo,
        requirement_date: requirementDate,
        delivery_place: deliveryPlace,
        manager_emails: managers.map(m => m.value).join(','),
        status: 1,
        status_track: 'Sent to management',
        last_updated: new Date(),
      });
  

      const itemInserts = materials.map((item) => ({
        ...item,
        ticket_id: nextTicketId,
      }));
  

      await MaterialRequestItem.bulkCreate(itemInserts);
  

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
  
      let whereClause = {};
  
      if (status) {
        const statusArray = status.split(',').map(Number);
        whereClause.status = {
          [Op.in]: statusArray,
        };
      }
  
      const materials = await MaterialRequest.findAll({
        where: whereClause,
      });
  
      if (materials.length === 0) {
        return res.status(404).json({ message: 'No materials found for the given status' });
      }
  
      res.status(200).json(materials);
    } catch (error) {
      console.error('Error fetching materials:', error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  });
  

  router.get('/pending-material-requests/details',authenticate, async (req, res) => {
    const ticketId = req.query['ticket-id'];
    console.log('req.query: ', req.query);
    console.log('ticketId: ', ticketId);
  
    try {
      const request = await MaterialRequest.findOne({ where: { ticket_id: ticketId } });
      const items = await MaterialRequestItem.findAll({ where: { ticket_id: ticketId } });
  
      res.json({ request, items });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  });


  router.put('/pending-material-requests/update-status',upload.single('file'),authenticate, async (req, res) => {
    try {
    
      const { ticket_id, status, remarks,status_track} = req.body;
      console.log('req.body: ', req.body);
   

   
      const request = await MaterialRequest.findOne({ where: { ticket_id } });
  
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }


      if(req.file){
        request.attachment=req.file.filename
      }
      request.status = status;
      request.remarks = remarks;
      request.status_track=status_track,
   
      await request.save();
  
      res.json({ message: 'Status updated successfully' });
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
module.exports = router;